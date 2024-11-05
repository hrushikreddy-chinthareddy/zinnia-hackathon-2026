import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import dayjs from 'dayjs';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import SswUpdateContainer from '@deps/components/ssw-edit/ssw-update/ssw-update-container';
import { TranslationFiles } from '@deps/config/translations';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ActiveWithdrawalCase, Carrier, RMDProgramType } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { mapTaskToActiveWithdrawalCaseTask } from '@deps/operations/tasks/v2/helpers';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { getPolicyDetailsSsr, searchPolicySSR, getSpecialProgramsSSR } from '@deps/queries/api/policies';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { getUserInfoFromUser, logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type SswUpdateProps = {
    policy: Policy;
    featureFlagDecisions: FeatureFlags;
    form: ActiveWithdrawalCase;
    document: DocumentData;
    specialProgramdetails: any;
};

const SswEdit = (props: SswUpdateProps) => {
    //If user clicks on any update other than bank Update he would be landing here
    const { form, policy, document, featureFlagDecisions, specialProgramdetails } = props;

    const router = useRouter();
    const { programType } = router.query;
    console.log(programType, '<==query');
    const [program, setProgram] = useState<Program[]>([]);

    const ProgramType = {
        PremiumDefault: 0,
        SSW: 2,
        RMD: 4,
        SSWNet: 6,
        EFTDraw: 5,
    };

    const activeProg =
        specialProgramdetails?.allocationDetails?.filter(
            program =>
                [ProgramType.PremiumDefault, ProgramType.RMD, ProgramType.SSW, ProgramType.SSWNet, ProgramType.EFTDraw].includes(
                    program.typeOfAlloc
                ) &&
                (program.termDate === '' || dayjs().isBefore(program.termDate))
        ) || null;

    useEffect(() => {
        const specialProg: Program[] = [];
        activeProg?.forEach((program: any) => {
            if (programType === 'SSW') {
                if ([ProgramType.SSW, ProgramType.SSWNet].includes(program.typeOfAlloc)) {
                    specialProg.push({
                        programType: 'SSW',
                        startDate: program.startDate,
                        nextDate: program.nextDate,
                        amount: program.dbAmount.toString(),
                        frequency: program.mode,
                        duration: program.duration.toString(),
                        status: RMDProgramType.Active,
                        allocationId: program.allocationId,
                    });
                }
            } else if (programType === 'RMD') {
                if (program.typeOfAlloc === ProgramType.RMD) {
                    specialProg.push({
                        programType: 'RMD',
                        startDate: program.startDate,
                        nextDate: program.nextDate,
                        amount: program.dbAmount.toString(),
                        frequency: program.mode,
                        duration: program.duration.toString(),
                        status: RMDProgramType.Active,
                        allocationId: program.allocationId,
                    });
                }
            } else if (programType === 'EFT') {
                if (program.typeOfAlloc === ProgramType.EFTDraw) {
                    specialProg.push({
                        programType: 'EFT Draw',
                        startDate: program.startDate,
                        nextDate: program.nextDate,
                        amount: program.dbAmount.toString(),
                        frequency: program.mode,
                        duration: program.duration.toString(),
                        status: 'Active' as any,
                        allocationId: program.allocationId,
                    });
                }
            }
        });
        setProgram(specialProg);
    }, []);

    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10  bg-white h-screen">
            <FormProvider form={form} initialForm={form} isOpenNigo={false} issueState="" featureFlagDecisions={featureFlagDecisions}>
                <div className="bg-gray-100 flex justify-center my-2">
                    <SswUpdateContainer policy={policy} document={document} program={program} setProgram={setProgram} />
                </div>
            </FormProvider>
        </div>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, query, req, res } = context;

        const taskId = (query.taskId as string) || '';
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);

        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('getServerSidePropsBankUpdatePage::Access token expired', {
                ...parseErrorInformation(e),
                file: 'utils/page',
                function: 'getServerSidePropsBankUpdatePage',
            });
            return serverSidePropsLogout();
        }

        try {
            const [translations, activeForm] = await Promise.all([
                await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS], nextI18nextConfig, ALL_LOCALES),
                await getCaseTaskByIdSSR(taskId, accessToken),
            ]);

            if (!activeForm) {
                logError('ssw-edit::Error getting task by id', {
                    taskId,
                    file: 'pages/ssw-update/ssw-edit',
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `ssw-edit/:id/error?errorCode=${ERROR_CODES.WITHDRAWAL_TASK_INITIALIZATION}`,
                        permanent: false,
                    },
                };
            }

            logInfo('ssw-edit::getCaseTaskByIdSSR task active form found', {
                taskId,
                file: 'pages/ssw-edit',
                function: 'getServerSideProps',
            });

            const form = mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm.data, userId: user?.name });

            const { documentNumber, contractNum, clientCode } = activeForm?.data || {};

            const userInfoForLogging = getUserInfoFromUser(user);

            const response = await searchPolicySSR(contractNum, [clientCode?.toUpperCase() as Carrier], accessToken, 1, 0);
            const planCode = response ? response[0]?.planCode : null;
            if (!planCode) {
                logError('ssw-edit::Policy plan code not found', {
                    taskId,
                    documentNumber,
                    clientCode,
                    contractNum,
                    file: 'pages/ssw-edit',
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `/ssw-edit/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                        permanent: false,
                    },
                };
            }

            const policy = await getPolicyDetailsSsr(contractNum, planCode, accessToken, userInfoForLogging);
            if (!policy) {
                logError('ssw-edit::Policy not found', {
                    taskId,
                    documentNumber,
                    clientCode,
                    contractNum,
                    file: 'pages/ssw-edit',
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `/ssw-edit/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                        permanent: false,
                    },
                };
            }

            const document = documentNumber
                ? await getDocumentSSR(documentNumber, DocumentType.SSW, clientCode?.toUpperCase(), accessToken as string)
                : null;

            const specialProgramdetails = await getSpecialProgramsSSR(form.data.contractNum, form.carrier, accessToken);
            if (!specialProgramdetails) {
                logError('ssw-edit::Special Program API responded - not found', {
                    taskId,
                    documentNumber,
                    clientCode,
                    contractNum,
                    file: 'pages/ssw-edit',
                    function: 'getServerSideProps',
                });
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
            logError('getServerSidePropsBankUpdatePage', { ...parseErrorInformation(error) });
            return {
                props: {},
            };
        }
    },
});

export default SswEdit;
