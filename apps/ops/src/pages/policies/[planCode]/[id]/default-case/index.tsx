import { getAccessToken } from '@auth0/nextjs-auth0';
import { Policy } from '@zinnia/api-types/types/sor';
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
import { ProcessType } from '@deps/models/case/enums';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { UserProfile } from '@deps/models/user-profile';
import { getTaskFormMetadata } from '@deps/operations/tasks/task-operations';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logError, logInfo, logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface DefaultCaseProps extends SegmentTrackedPageProps {
    policy: Policy;
    user: UserProfile;
    taskMetadata: FormMetadata[];
    correlationId: string;
}

const DefaultCase = ({ policy, user, taskMetadata, correlationId }: DefaultCaseProps) => {
    useSegmentPageTracker(user, SegmentPageName.DefaultCaseDataEntry, { correlationId, policyNumber: policy.policyNumber });

    return (
        <>
            <PageHead titleKey="defaultCase" />
            <DefaultCaseProvider policy={policy} user={user} correlationId={correlationId}>
                <DefaultCaseContainer taskMetadata={taskMetadata}></DefaultCaseContainer>
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
                logWarn('getServerSidePropsPolicyDetailsPage::Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }
            // Create a permissions object to pass to the page, strongly typed using the enum.
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);
            const shouldShowDefaultCase = featureFlagDecisions?.[FEATURE_FLAGS.SERVICE_REQUEST_FORM_ENABLED];

            if (!shouldShowDefaultCase) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );
            try {
                const policy = await getPolicyDetailsSsr(policyNumber, planCode, accessToken, loggingContext, true);

                const taskMetadata = await getTaskFormMetadata(
                    policy?.carrierId || '',
                    TaskType.Default_Case_DataEntry,
                    ProcessType.DEFAULT_CASE,
                    accessToken,
                    loggingContext,
                    false
                );

                const currentTaskMetadata = taskMetadata?.schemaContent?.tabSchemas || ([] as FormMetadata[]);

                if (!currentTaskMetadata.length) {
                    const fallbackMetadata: FormMetadata = {
                        title: '',
                        formSchema: taskMetadata?.formSchema ?? {},
                        uiSchema: taskMetadata?.uiSchema ?? {},
                    };
                    currentTaskMetadata.push(fallbackMetadata ?? {});
                }

                if (!policy) {
                    logInfo('default-case/policy-not-found', loggingContext);
                    return {
                        redirect: {
                            destination: `/404?title=policyNotFound&planCode=${planCode}&policyNumber=${policyNumber}`,
                            permanent: false,
                        },
                    };
                }

                //transform schema options with api
                await applyDynamicOptions(
                    { ...policy, taskType: TaskType.Default_Case_DataEntry, carrier: policy.carrierId },
                    accessToken,
                    currentTaskMetadata
                );
                return {
                    props: {
                        ...translations,
                        policy,
                        user,
                        correlationId,
                        taskMetadata: currentTaskMetadata,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsPolicyDetailsPage', { ...parseErrorInformation(error), ...loggingContext });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'policies/[planCode]/[id]/default-case', function: 'getServerSideProps', page: 'policies/:planCode/:id/default-case' }
);

export default DefaultCase;
