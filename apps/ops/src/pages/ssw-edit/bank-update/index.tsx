import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import BankUpdateContainer from '@deps/components/ssw-edit/bank-update/bank-update-container';
import { TranslationFiles } from '@deps/config/translations';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ActiveWithdrawalCase, Carrier } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { mapTaskToActiveWithdrawalCaseTask } from '@deps/operations/tasks/v2/helpers';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { getPolicyDetailsSsr, searchPolicySSR } from '@deps/queries/api/policies';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { getUserInfoFromUser, logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type BankUpdateProps = {
    clientCode: string;
    policy: Policy;
    featureFlagDecisions: FeatureFlags;
    form: ActiveWithdrawalCase;
    document: DocumentData;
};

const BankUpdate = (props: BankUpdateProps) => {
    const { form, clientCode, policy, featureFlagDecisions, document } = props;

    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10  bg-white h-screen">
            <FormProvider form={form} initialForm={form} issueState={''} isOpenNigo={false} featureFlagDecisions={featureFlagDecisions}>
                <div className="bg-gray-100 flex justify-center my-2">
                    <BankUpdateContainer policy={policy} clientCode={clientCode} document={document} />
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
        // Create a permissions object to pass to the page, strongly typed using the enum.
        // const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);
        // if (!doesUserHasPagePermissions) {
        //     return {
        //         redirect: {
        //             destination: '/403',
        //             permanent: false,
        //         },
        //     };
        // }

        try {
            const [translations, activeForm] = await Promise.all([
                await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS], nextI18nextConfig, ALL_LOCALES),
                await getCaseTaskByIdSSR(taskId, accessToken),
            ]);

            if (!activeForm) {
                logError('bank-update::Error getting task by id', {
                    taskId,
                    file: 'pages/bank-update',
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `bank-update/:id/error?errorCode=${ERROR_CODES.WITHDRAWAL_TASK_INITIALIZATION}`,
                        permanent: false,
                    },
                };
            }

            logInfo('bank-update::getCaseTaskByIdSSR task active form found', {
                taskId,
                file: 'pages/bank-update',
                function: 'getServerSideProps',
            });

            const form = mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm.data, userId: user?.name });

            const { documentNumber, contractNum, clientCode } = activeForm?.data || {};

            const userInfoForLogging = getUserInfoFromUser(user);

            const response = await searchPolicySSR(contractNum, [clientCode?.toUpperCase() as Carrier], accessToken, 1, 0);
            const planCode = response ? response[0]?.planCode : null;
            if (!planCode) {
                logError('bank-update::Policy plan code not found', {
                    taskId,
                    documentNumber,
                    clientCode,
                    contractNum,
                    file: 'pages/bank-update',
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `/bank-update/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                        permanent: false,
                    },
                };
            }

            const policy = await getPolicyDetailsSsr(contractNum, planCode, accessToken, userInfoForLogging);
            // const docType = docTypes[activeForm?.process || ''];
            if (!policy) {
                logError('bank-update::Policy not found', {
                    taskId,
                    documentNumber,
                    clientCode,
                    contractNum,
                    file: 'pages/bank-update',
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `/bank-update/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                        permanent: false,
                    },
                };
            }

            const document = documentNumber
                ? await getDocumentSSR(documentNumber, DocumentType.SSW, clientCode?.toUpperCase(), accessToken as string)
                : null;

            return {
                props: {
                    ...translations,
                    form,
                    clientCode,
                    policy,
                    document,
                    user,
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

export default BankUpdate;
