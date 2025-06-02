import { getAccessToken } from '@auth0/nextjs-auth0';
import { Policy } from '@zinnia/api-types/types/sor';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import WithholdingUpdateContainer from '@deps/components/ssw-edit/withholding-update/withholding-update-container';
import { TranslationFiles } from '@deps/config/translations';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ActiveWithdrawalCase, Carrier } from '@deps/models/case/withdrawal/case';
import { mapTaskToActiveWithdrawalCaseTask } from '@deps/operations/tasks/v2/helpers';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import { getPolicyDetailsSsr, searchPolicySSR } from '@deps/queries/api/policies';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import { logError, logInfo, logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface WithholdingUpdateProps {
    clientCode: string;
    policy: Policy;
    form: ActiveWithdrawalCase;
    document: DocumentData;
}

const WithholdingUpdate = (props: WithholdingUpdateProps) => {
    const { form, clientCode, policy, document } = props;

    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10  bg-white h-screen">
            <FormProvider form={form} initialForm={form} issueState={''} isOpenNigo={false}>
                <div className="bg-gray-100 flex justify-center my-2">
                    <WithholdingUpdateContainer policy={policy} clientCode={clientCode} document={document} />
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

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('getServerSideProps-WithholdingsUpdatePage::Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            try {
                const [translations, activeForm] = await Promise.all([
                    await serverSideTranslations(
                        locale,
                        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                        nextI18nextConfig,
                        ALL_LOCALES
                    ),
                    await getCaseTaskByIdSSR(taskId, accessToken, loggingContext),
                ]);

                if (!activeForm) {
                    logError('withholding-update::Error getting task by id', loggingContext);
                    return {
                        redirect: {
                            destination: `/ssw-edit/error?errorCode=${ERROR_CODES.WITHDRAWAL_TASK_INITIALIZATION}`,
                            permanent: false,
                        },
                    };
                }

                logInfo('withholding-update::getCaseTaskByIdSSR task active form found', loggingContext);

                const form = mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm.data, userId: user?.name });

                const { documentNumber, contractNum, clientCode } = activeForm?.data || {};

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
                    logError('withholding-update::Policy plan code not found', {
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

                const policy = await getPolicyDetailsSsr(contractNum, planCode, accessToken, loggingContext, true);
                if (!policy) {
                    logError('withholding-update::Policy not found', {
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

                const document = documentNumber
                    ? await getDocumentV2SSR(
                          documentNumber,
                          DocumentType.SSW,
                          clientCode?.toUpperCase(),
                          accessToken as string,
                          loggingContext
                      )
                    : null;

                console.log(form.data.formRequest.formSource, 'activeForm source');

                return {
                    props: {
                        ...translations,
                        form,
                        clientCode,
                        policy,
                        document,
                        user,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsWithholdingUpdatePage', { ...parseErrorInformation(error), ...loggingContext });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'ssw-edit/withholding-update', function: 'getServerSideProps', page: 'withholding-update' }
);

export default WithholdingUpdate;
