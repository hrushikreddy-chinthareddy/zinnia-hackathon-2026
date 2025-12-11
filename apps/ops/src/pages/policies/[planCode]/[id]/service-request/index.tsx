import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { v4 as uuidV4 } from 'uuid';

import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import DefaultCaseContainer from '@deps/containers/default-case/default-case-container';
import { applyDynamicOptions } from '@deps/containers/task-container/task-handlers/handle-task';
import { DefaultCaseProvider } from '@deps/contexts/DefaultCaseContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { DefaultDataEntryTask } from '@deps/models/case/default-case';
import { ProcessType } from '@deps/models/case/enums';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { UserProfile } from '@deps/models/user-profile';
import { getTaskFormMetadata } from '@deps/operations/tasks/task-operations';
import {
    getPolicyDetailsSsr,
    searchPolicySSR,
} from '@deps/queries/api/policies';
import { Source } from '@deps/types/search';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import {
    logError,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';
import nextI18nextConfig from 'next-i18next.config';

interface ServiceRequestProps extends SegmentTrackedPageProps {
    policy: Policy;
    defaultTask: DefaultDataEntryTask;
    user: UserProfile;
    taskMetadata: FormMetadata[];
    correlationId: string;
}

const ServiceRequest = ({
    policy,
    defaultTask,
    user,
    taskMetadata,
    correlationId,
}: ServiceRequestProps) => {
    useSegmentPageTracker(user, SegmentPageName.DefaultCaseDataEntry, {
        correlationId,
        policyNumber: policy.policyNumber,
    });

    return (
        <>
            <PageHead titleKey="defaultCase" />
            <DefaultCaseProvider
                policy={policy}
                user={user}
                correlationId={correlationId}
                taskData={defaultTask}
            >
                <DefaultCaseContainer
                    taskMetadata={taskMetadata}
                ></DefaultCaseContainer>
            </DefaultCaseProvider>
        </>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, req, res, params } = context;
            const planCode = (params?.planCode as string) || '';
            const policyNumber = (params?.id as string) || '';
            const correlationId = uuidV4();

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn(
                    'getServerSidePropsPolicyDetailsPage::Access token expired',
                    {
                        ...parseErrorInformation(e),
                        ...loggingContext,
                    }
                );
                return serverSidePropsLogout();
            }

            try {
                const policy = await getPolicyDetailsSsr(
                    policyNumber,
                    planCode,
                    accessToken,
                    loggingContext,
                    true
                );
                const limit = 1;
                const offset = 0;

                const [taskMetadata, policyReference, translations] =
                    await Promise.all([
                        getTaskFormMetadata(
                            policy?.carrierId || '',
                            TaskType.Default_Case_DataEntry,
                            ProcessType.DEFAULT_CASE,
                            accessToken,
                            loggingContext,
                            false
                        ),
                        searchPolicySSR(
                            policyNumber,
                            [policy?.carrierId as Carrier],
                            accessToken,
                            limit,
                            offset,
                            loggingContext
                        ),
                        serverSideTranslations(
                            locale,
                            [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                            nextI18nextConfig,
                            ALL_LOCALES
                        ),
                    ]);

                if (!policy || policyReference?.[0]?.source !== Source.ZAHARA) {
                    logError('service-request/policy-not-found', {
                        ...loggingContext,
                        policyNumber: policyNumber,
                        planCode: planCode,
                        source: policyReference?.[0]?.source,
                    });
                    return {
                        redirect: {
                            destination: `/404`,
                            permanent: false,
                        },
                    };
                }

                const currentTaskMetadata =
                    taskMetadata?.schemaContent?.tabSchemas ||
                    ([] as FormMetadata[]);

                if (!currentTaskMetadata.length) {
                    const fallbackMetadata: FormMetadata = {
                        title: '',
                        formSchema: taskMetadata?.formSchema ?? {},
                        uiSchema: taskMetadata?.uiSchema ?? {},
                    };
                    currentTaskMetadata.push(fallbackMetadata ?? {});
                }

                const defaultTask = {
                    taskType: TaskType.Default_Case_DataEntry,
                    carrier: policy.carrierId,
                };
                //transform schema options with api
                await applyDynamicOptions(
                    defaultTask,
                    accessToken,
                    currentTaskMetadata,
                    loggingContext
                );
                return {
                    props: {
                        ...translations,
                        policy,
                        defaultTask,
                        user,
                        correlationId,
                        taskMetadata: currentTaskMetadata,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsPolicyDetailsPage', {
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
        file: 'policies/[planCode]/[id]/service-request',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/service-request',
    }
);

export default ServiceRequest;
