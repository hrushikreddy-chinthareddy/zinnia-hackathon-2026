import { getAccessToken } from '@auth0/nextjs-auth0';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { getFullFrequency } from '@deps/components/ssw-edit/ssw-edit-helpers';
import SswUpdate from '@deps/components/ssw-edit/ssw-update/ssw-update';
import { TranslationFiles } from '@deps/config/translations';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { SpecialProgramType } from '@deps/models/case/enums';
import {
    ActiveWithdrawalCase,
    Carrier,
    RMDProgramType,
    SpecialProgram,
} from '@deps/models/case/withdrawal/case';
import { mapTaskToActiveWithdrawalCaseTask } from '@deps/operations/tasks/v2/helpers';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import {
    getPolicyDetailsSsr,
    searchPolicySSR,
    getSpecialProgramsSSR,
} from '@deps/queries/api/policies';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logError,
    logInfo,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';
import nextI18nextConfig from 'next-i18next.config';

const PROGRAM_CODE = {
    PremiumDefault: 0,
    SSW: 2,
    RMD: 4,
    SSWNet: 6,
    EFTDraw: 5,
} as const;

function mapAllocationToProgram(
    program: SpecialProgram,
    programType: string,
    programCode: typeof PROGRAM_CODE
): Program | null {
    const frequencyMapping = getFullFrequency(program.mode);
    const baseProgram = {
        startDate: program.startDate,
        nextDate: program.nextDate,
        amount: program.dbAmount.toString(),
        duration: program.duration.toString(),
        status: RMDProgramType.Active,
        allocationId: program.allocationId,
    };

    if (programType === SpecialProgramType.SSW) {
        if (
            program.typeOfAlloc === programCode.SSW ||
            program.typeOfAlloc === programCode.SSWNet
        ) {
            return {
                ...baseProgram,
                programType: 'SSW',
                frequency: frequencyMapping,
            };
        }
    } else if (programType === SpecialProgramType.RMD) {
        if (program.typeOfAlloc === programCode.RMD) {
            return {
                ...baseProgram,
                programType: 'RMD',
                frequency: frequencyMapping,
            };
        }
    } else if (programType === SpecialProgramType.EFT) {
        if (program.typeOfAlloc === programCode.EFTDraw) {
            return {
                ...baseProgram,
                programType: 'EFT Draw',
                frequency: program.mode,
            };
        }
    }
    return null;
}

function getProgramsFromActiveAllocations(
    activeProg: SpecialProgram[] | null,
    programType: string,
    programCode: typeof PROGRAM_CODE
): Program[] {
    if (!activeProg) return [];
    const result: Program[] = [];
    activeProg.forEach((allocation) => {
        const program = mapAllocationToProgram(
            allocation,
            programType,
            programCode
        );
        if (program) result.push(program);
    });
    return result;
}

type FormProgramDateValue = string | { text?: string };

type FormProgram = Omit<Program, 'startDate' | 'nextDate'> & {
    startDate?: FormProgramDateValue;
    nextDate?: FormProgramDateValue;
};

function getProgramsFromFormData(form: ActiveWithdrawalCase): Program[] {
    const prog = form?.data?.formRequest?.formUpdateData?.programs as
        | FormProgram[]
        | undefined;
    if (!prog) return [];
    return prog.map((program) => {
        const startDate =
            program.startDate != null && typeof program.startDate === 'object'
                ? (program.startDate as { text?: string }).text ?? ''
                : (program.startDate as string) ?? '';
        const nextDate =
            program.nextDate != null && typeof program.nextDate === 'object'
                ? (program.nextDate as { text?: string }).text ?? ''
                : (program.nextDate as string) ?? '';
        return {
            programType: program.programType,
            startDate,
            nextDate,
            frequency: program.frequency,
            duration: program.duration,
            amount: program.amount,
            allocationId: program.allocationId,
            status: program?.status ?? '',
        };
    });
}

type SswUpdateProps = {
    policy: Policy;
    featureFlagDecisions: FeatureFlags;
    form: ActiveWithdrawalCase;
    document: DocumentData;
    specialProgramdetails: SpecialProgram | null;
};

const SswEdit = (props: SswUpdateProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate' });
    const searchParams = useSearchParams();
    const isFormStateReadOnly = searchParams.get('action') === 'readonly';
    const isProgramTerminate =
        searchParams.get('programType') === 'SSW_TERMINATE';

    const router = useRouter();
    const {
        form,
        policy,
        document,
        featureFlagDecisions,
        specialProgramdetails,
    } = props;

    const { programType } = router.query;
    const [program, setProgram] = useState<Program[]>([]);

    const activeAllocationCodes: number[] = [
        PROGRAM_CODE.PremiumDefault,
        PROGRAM_CODE.RMD,
        PROGRAM_CODE.SSW,
        PROGRAM_CODE.SSWNet,
        PROGRAM_CODE.EFTDraw,
    ];
    const activeProg =
        specialProgramdetails?.allocationDetails?.filter(
            (allocation: SpecialProgram) =>
                activeAllocationCodes.includes(allocation.typeOfAlloc) &&
                (allocation.termDate === '' ||
                    dayjs().isBefore(allocation.termDate))
        ) ?? null;

    useEffect(() => {
        const programs = isFormStateReadOnly
            ? getProgramsFromFormData(form)
            : getProgramsFromActiveAllocations(
                  activeProg,
                  programType as string,
                  PROGRAM_CODE
              );
        setProgram(programs);
    }, [isFormStateReadOnly]);

    if (program?.length === 0)
        return (
            <div className="md:px-6 md:py-8 lg:px-8 lg:py-10 h-screen my-auto flex justify-center align-middle ">
                <div className="bg-gray-100  my-auto">
                    <CardInfo
                        cta={{
                            action: () => {
                                router.back();
                            },
                            text: t('back'),
                        }}
                        title={t('noProgramFound')}
                        className="justify-center bg-white h-[450px] w-[900px]"
                    />
                </div>
            </div>
        );

    return (
        <>
            {isProgramTerminate && (
                <div className="flex flex-row-reverse items-center justify-start rounded-lg border border-[#FA7625]  bg-[#FFF7E3] p-4 shadow-md">
                    <p className="text-bold m-auto">{t('programTerminated')}</p>
                </div>
            )}
            <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10  bg-white h-screen">
                <FormProvider
                    form={form}
                    initialForm={form}
                    isOpenNigo={false}
                    issueState=""
                    featureFlagDecisions={featureFlagDecisions}
                    isFormStateReadOnly={isFormStateReadOnly}
                >
                    <div className="bg-gray-100 flex justify-center my-2 pb-4">
                        <WorkflowProvider>
                            <SswUpdate
                                policy={policy}
                                document={document}
                                programs={program}
                                programType={programType as string}
                            />
                        </WorkflowProvider>
                    </div>
                </FormProvider>
            </div>
        </>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, query, req, res } = context;

            const taskId = (query.taskId as string) || '';

            const [featureFlagDecisions, accessTokenResult] = await Promise.all(
                [
                    optimizelyService.getFeatureFlagDecisions(
                        user.sub,
                        loggingContext
                    ),
                    getAccessToken(req, res).catch((e) => {
                        logWarn(
                            'getServerSidePropsBankUpdatePage::Access token expired',
                            { ...parseErrorInformation(e), ...loggingContext }
                        );
                        return null;
                    }),
                ]
            );

            if (!accessTokenResult || !accessTokenResult.accessToken) {
                return serverSidePropsLogout();
            }
            const accessToken = accessTokenResult.accessToken;

            try {
                const [translations, activeForm] = await Promise.all([
                    await serverSideTranslations(
                        locale,
                        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                        nextI18nextConfig,
                        ALL_LOCALES
                    ),
                    await getCaseTaskByIdSSR(
                        taskId,
                        accessToken,
                        loggingContext
                    ),
                ]);

                if (!activeForm) {
                    logError(
                        'ssw-edit::Error getting task by id',
                        loggingContext
                    );
                    return {
                        redirect: {
                            destination: `ssw-edit/error?errorCode=${ERROR_CODES.WITHDRAWAL_TASK_INITIALIZATION}`,
                            permanent: false,
                        },
                    };
                }

                logInfo(
                    'ssw-edit::getCaseTaskByIdSSR task active form found',
                    loggingContext
                );

                const form = mapTaskToActiveWithdrawalCaseTask(activeForm, {
                    ...activeForm.data,
                    userId: user?.name,
                });

                const { documentNumber, contractNum, clientCode } =
                    activeForm?.data || {};

                const response = await searchPolicySSR(
                    contractNum,
                    [clientCode?.toUpperCase() as Carrier],
                    accessToken,
                    1,
                    0,
                    loggingContext
                );
                const planCode = response ? response[0]?.planCode : null;
                if (!planCode) {
                    logError('ssw-edit::Policy plan code not found', {
                        taskId,
                        documentNumber,
                        clientCode,
                        contractNum,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: `/ssw-edit/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                            permanent: false,
                        },
                    };
                }

                // Fetch policy, document, and special programs in parallel
                const [policy, document, specialProgramdetails] =
                    await Promise.all([
                        getPolicyDetailsSsr(
                            contractNum,
                            planCode,
                            accessToken,
                            loggingContext,
                            true
                        ),
                        documentNumber
                            ? getDocumentV2SSR(
                                  documentNumber,
                                  DocumentType.Systematic,
                                  clientCode?.toUpperCase(),
                                  accessToken as string,
                                  loggingContext
                              )
                            : Promise.resolve(null),
                        getSpecialProgramsSSR(
                            form.data.contractNum,
                            form.carrier,
                            accessToken,
                            loggingContext
                        ),
                    ]);

                if (!policy) {
                    logError('ssw-edit::Policy not found', {
                        taskId,
                        documentNumber,
                        clientCode,
                        contractNum,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: `/ssw-edit/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                            permanent: false,
                        },
                    };
                }

                if (!document) {
                    logError('ssw-edit::Error getting document', {
                        documentNumber,
                        clientCode,
                        contractNum,
                        taskId,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: `/ssw-edit/error?errorCode=${ERROR_CODES.DOCUMENT_RETRIEVAL}`,
                            permanent: false,
                        },
                    };
                }
                if (!specialProgramdetails) {
                    logError(
                        'ssw-edit::Special Program API responded - not found',
                        {
                            taskId,
                            documentNumber,
                            clientCode,
                            contractNum,
                            ...loggingContext,
                        }
                    );
                    return {
                        redirect: {
                            destination: `/ssw-edit/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                            permanent: false,
                        },
                    };
                }

                return {
                    props: {
                        ...translations,
                        form,
                        policy,
                        document,
                        specialProgramdetails,
                        featureFlagDecisions,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsBankUpdatePage', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                });
                return {
                    props: {},
                };
            }
        },
    },
    {
        file: 'ssw-edit/ssw-update',
        function: 'getServerSideProps',
        page: 'ssw-edit/ssw-update',
    }
);

export default SswEdit;
