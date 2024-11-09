import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import NoNavLayout from '@deps/components/no-nav-layout';
import { buildTaskLink } from '@deps/components/tasks-listing/task-listing.helpers';
import { TranslationFiles } from '@deps/config/translations';
import TaskContainer from '@deps/containers/task-container/task-container';
import { TaskProvider } from '@deps/containers/task-container/task-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { ProcessType } from '@deps/models/case/enums';
import { docTypes } from '@deps/models/case/helpers';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskByIdSSR, getTaskFormMetadata } from '@deps/operations/tasks/taskOperations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getPolicyDetailsSsr, searchPolicySSR } from '@deps/queries/api/policies';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { getUserInfoFromUser, logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type TaskPageProps = {
    policy: Policy;
    clientCode: string;
    documentNumber: string;
    docType: string;
    caseId: string;
    taskId: string;
    task: ManagementTask;
    taskMetadata: FormMetadata;
    taskData: any;
    taskInfoLink: string;
};

export const TaskPage: React.FC<TaskPageProps> = ({ policy, documentNumber, docType, task, taskMetadata, taskInfoLink }: TaskPageProps) => {
    return (
        <div>
            <NoNavLayout fullHeight={true}>
                <TaskProvider taskMetadata={taskMetadata} initialTask={task}>
                    <TaskContainer policy={policy} docType={docType} documentNumber={documentNumber} taskInfoLink={taskInfoLink} />
                </TaskProvider>
            </NoNavLayout>
        </div>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: any) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, query, req, res } = context;
        const taskId = (query.taskId as string) || '';

        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);

        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('getServerSidePropsTaskPage::Access token expired', {
                ...parseErrorInformation(e),
                file: 'pages/task/{taskId}/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const hasPermissionToReadCaseManagement = await doesUserHavePagePermissions(
            accessToken,
            user,
            UserPermission.AllowReadCaseManagement
        );
        if (!hasPermissionToReadCaseManagement) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        try {
            const [translations, task] = await Promise.all([
                await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS], nextI18nextConfig, ALL_LOCALES),
                await getCaseTaskByIdSSR(taskId, accessToken),
            ]);
            if (!task) {
                logError('Task::Error getting task by id', {
                    taskId,
                    file: 'pages/task',
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `task/:id/error?errorCode=${ERROR_CODES.SUITABILITY_REVIEW_TASK_INITIALIZATION}`,
                        permanent: false,
                    },
                };
            }

            const { taskType, carrier, caseId, process } = task;
            const { documentNumber, contractNum } = task.data;

            // If feature flag is not enabled, redirect to error page
            if (!isFormFeatureEnabled(process as ProcessType, carrier, featureFlagDecisions)) {
                logWarn('task/:id::feature flag not enabled', { carrier });
                // return {
                //     redirect: {
                //         destination: '/403',
                //         permanent: false,
                //     },
                // };
            }

            const taskMetadata = await getTaskFormMetadata(carrier, taskType as TaskType, process as ProcessType, accessToken);
            if (!taskMetadata?.formSchema || !taskMetadata?.uiSchema) {
                logError('task::Form schema not found', {
                    taskId,
                    documentNumber,
                    carrier,
                    contractNum,
                    file: `pages/task/${taskId}/${taskType}`,
                    function: 'getServerSideProps',
                });
            }

            const response = await searchPolicySSR(contractNum, [carrier?.toUpperCase() as Carrier], accessToken, 1, 0);
            const planCode = response ? response[0]?.planCode : null;
            if (!planCode) {
                logError('task::Policy plan code not found', {
                    taskId,
                    documentNumber,
                    carrier,
                    contractNum,
                    file: `pages/${taskType}`,
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.PLAN_CODE_NOT_FOUND}`,
                        permanent: false,
                    },
                };
            }

            const userInfoForLogging = getUserInfoFromUser(user);
            const policy = await getPolicyDetailsSsr(contractNum, planCode, accessToken, userInfoForLogging);
            if (!policy) {
                logError('task::Policy not found', {
                    taskId,
                    documentNumber,
                    carrier,
                    contractNum,
                    file: `pages/${taskType}`,
                    function: 'getServerSideProps',
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                        permanent: false,
                    },
                };
            }
            const taskInfoLink = buildTaskLink(taskId, caseId || '', process || '', documentNumber, carrier);
            const docType = docTypes[task?.process];
            return {
                props: {
                    ...translations,
                    policy,
                    taskMetadata,
                    task,
                    docType,
                    documentNumber,
                    taskInfoLink,
                },
            };
        } catch (error) {
            logError('getServerSidePropsTask', { ...parseErrorInformation(error) });
            return {
                props: {},
            };
        }
    },
});

export default TaskPage;
