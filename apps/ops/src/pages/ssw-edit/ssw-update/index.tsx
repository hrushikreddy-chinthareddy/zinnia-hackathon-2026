import { getAccessToken } from '@auth0/nextjs-auth0';
import { Policy } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
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
import nextI18nextConfig from 'next-i18next.config';

type SswUpdateProps = {
    policy: Policy;
    featureFlagDecisions: FeatureFlags;
    form: ActiveWithdrawalCase;
    document: DocumentData;
    specialProgramdetails: any;
};

const SswEdit = (props: SswUpdateProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate' });

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

    const ProgramCode = {
        PremiumDefault: 0,
        SSW: 2,
        RMD: 4,
        SSWNet: 6,
        EFTDraw: 5,
    };

    const activeProg =
        specialProgramdetails?.allocationDetails?.filter(
            (program: any) =>
                [
                    ProgramCode.PremiumDefault,
                    ProgramCode.RMD,
                    ProgramCode.SSW,
                    ProgramCode.SSWNet,
                    ProgramCode.EFTDraw,
                ].includes(program.typeOfAlloc) &&
                (program.termDate === '' || dayjs().isBefore(program.termDate))
        ) || null;

    useEffect(() => {
        const specialProg: Program[] = [];
        activeProg?.forEach((program: any) => {
            const freqencyMapping = getFullFrequency(program.mode);
            if (programType === SpecialProgramType.SSW) {
                if (
                    [ProgramCode.SSW, ProgramCode.SSWNet].includes(
                        program.typeOfAlloc
                    )
                ) {
                    specialProg.push({
                        programType: 'SSW',
                        startDate: program.startDate,
                        nextDate: program.nextDate,
                        amount: program.dbAmount.toString(),
                        frequency: freqencyMapping,
                        duration: program.duration.toString(),
                        status: RMDProgramType.Active,
                        allocationId: program.allocationId,
                    });
                }
            } else if (programType === SpecialProgramType.RMD) {
                if (program.typeOfAlloc === ProgramCode.RMD) {
                    specialProg.push({
                        programType: 'RMD',
                        startDate: program.startDate,
                        nextDate: program.nextDate,
                        amount: program.dbAmount.toString(),
                        frequency: freqencyMapping,
                        duration: program.duration.toString(),
                        status: RMDProgramType.Active,
                        allocationId: program.allocationId,
                    });
                }
            } else if (programType === SpecialProgramType.EFT) {
                if (program.typeOfAlloc === ProgramCode.EFTDraw) {
                    specialProg.push({
                        programType: 'EFT Draw',
                        startDate: program.startDate,
                        nextDate: program.nextDate,
                        amount: program.dbAmount.toString(),
                        frequency: program.mode,
                        duration: program.duration.toString(),
                        status: RMDProgramType.Active,
                        allocationId: program.allocationId,
                    });
                }
            }
        });
        setProgram(specialProg);
    }, []);

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
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10  bg-white h-screen">
            <FormProvider
                form={form}
                initialForm={form}
                isOpenNigo={false}
                issueState=""
                featureFlagDecisions={featureFlagDecisions}
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
