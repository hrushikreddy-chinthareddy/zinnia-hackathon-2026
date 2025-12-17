import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { RoleLabel } from '@deps/constants/policy';
import DefaultCaseContainer from '@deps/containers/default-case/default-case-container';
import { applyDynamicOptions } from '@deps/containers/task-container/task-handlers/handle-task';
import { DefaultCaseProvider } from '@deps/contexts/DefaultCaseContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Case } from '@deps/models/case/case';
import {
    DefaultDataEntryTask,
    RequestType,
} from '@deps/models/case/default-case';
import { ProcessType } from '@deps/models/case/enums';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { UserPermission, UserProfile } from '@deps/models/user-profile';
import { getTaskFormMetadata } from '@deps/operations/tasks/task-operations';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logError,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';
interface OperationsReviewProps extends SegmentTrackedPageProps {
    caseDetails: Case;
    defaultTask: DefaultDataEntryTask;
    user: UserProfile;
    taskMetadata: FormMetadata[];
    correlationId: string;
}

const OperationsReview = ({
    caseDetails,
    defaultTask,
    user,
    taskMetadata,
    correlationId,
}: OperationsReviewProps) => {
    useSegmentPageTracker(user, SegmentPageName.OperationsReview, {
        correlationId,
        caseId: caseDetails.id,
    });

    return (
        <>
            <PageHead titleKey="operationsReview" />
            <DefaultCaseProvider
                caseDetails={caseDetails}
                user={user}
                correlationId={correlationId}
                taskData={defaultTask}
                requestType={RequestType.Ops_Service_Request}
            >
                <DefaultCaseContainer
                    taskMetadata={taskMetadata}
                    taskType={TaskType.Operation_Review}
                ></DefaultCaseContainer>
            </DefaultCaseProvider>
        </>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);

            const { locale = DEFAULT_LOCALE, params, req, res } = context;
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

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            const doesUserHasPagePermissions =
                await doesUserHavePagePermissions(
                    context,
                    UserPermission.AllowOpsCaseReviewRequest,
                    loggingContext
                );
            const enableOpsReviewRequest =
                featureFlagDecisions?.[FEATURE_FLAGS.OPS_REVIEW_REQUEST];

            if (!doesUserHasPagePermissions || !enableOpsReviewRequest) {
                logWarn(
                    'getServerSidePropsPolicyDetailsPage:: User does not have permissions or feature not enabled',
                    {
                        ...loggingContext,
                        caseId: params?.id,
                        doesUserHasPagePermissions,
                        enableOpsReviewRequest,
                    }
                );
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const caseId = (params?.id as string) || '';

            const caseDetails = await getCaseDetailsSSR(
                caseId,
                accessToken as string,
                loggingContext,
                featureFlagDecisions
            );

            if (!caseDetails) {
                logError('operation-review::Error fetching case details', {
                    ...loggingContext,
                    caseId,
                });

                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }
            const owner = caseDetails.parties?.find((pr) =>
                pr.partyRole.includes(RoleLabel.OWNER)
            );

            const defaultTask = {
                taskType: TaskType.Operation_Review,
                carrier: caseDetails.carrier,
                caseDetails: {
                    caseSubType: '',
                    lineOfBusiness: caseDetails?.productName || '',
                    contractNumber: caseDetails?.policyNumber || '',
                    carrier: caseDetails?.carrier || '',
                    referenceCaseId: caseDetails?.id || '',
                    customerDetails: {
                        firstName: owner?.firstName || '',
                        lastName: owner?.lastName || '',
                        taxId: owner?.ssn || '',
                    },
                    reporterDetails: {
                        requestedBy: user?.name || '',
                    },
                },
            };

            const [taskMetadata, translations, authorizedCarriers] =
                await Promise.all([
                    getTaskFormMetadata(
                        caseDetails?.carrier || '',
                        TaskType.Operation_Review,
                        ProcessType.DEFAULT_CASE,
                        accessToken,
                        loggingContext,
                        false
                    ),
                    serverSideTranslations(
                        locale,
                        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                        nextI18nextConfig,
                        ALL_LOCALES
                    ),
                    listCarriersPage(
                        context,
                        UserPermission.AllowReadCaseManagement,
                        loggingContext
                    ),
                ]);

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

            await applyDynamicOptions(
                defaultTask,
                accessToken,
                currentTaskMetadata,
                loggingContext
            );

            return {
                props: {
                    caseDetails,
                    defaultTask,
                    authorizedCarriers,
                    user,
                    locale,
                    taskMetadata: currentTaskMetadata,
                    ...translations,
                },
            };
        },
    },
    {
        file: 'cases/operation-review/index',
        function: 'getServerSideProps',
        page: 'cases/operation-review/index',
    }
);

export default OperationsReview;
