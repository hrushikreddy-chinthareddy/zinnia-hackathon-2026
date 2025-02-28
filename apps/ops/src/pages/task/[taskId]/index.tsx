import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { convertToCamelCase } from '@zinnia/utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import NoNavLayout from '@deps/components/no-nav-layout';
import { buildCaseLink } from '@deps/components/tasks-listing/task-listing.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { getNigoExceptions } from '@deps/containers/task-container/components/steps/nigo-details/nigo-details.helper';
import TaskContainer from '@deps/containers/task-container/task-container';
import { TaskProvider } from '@deps/containers/task-container/task-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskById, getTaskFormMetadata } from '@deps/operations/tasks/task-operations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { optimizelyService } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import { TaskMetadataHelper } from '@deps/utils/tasks/task-metadata-helper';
import nextI18nextConfig from 'next-i18next.config';
import { isProd } from '@deps/utils/environment.helper';
import { applyDynamicOptions } from '../../../containers/task-container/task-handlers/handle-task';
import { ProcessType } from '@deps/models/case/enums';

type TaskPageProps = {
    task: ManagementTask;
    taskMetadata: FormMetadata[];
    correlationId: string;
    taskInfoLink: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
};

export const TaskPage: React.FC<TaskPageProps> = ({
    task,
    taskInfoLink,
    correlationId,
    nigoExceptions,
    nigoSubExceptions,
    taskMetadata,
}: TaskPageProps) => {
    return (
        <div>
            <NoNavLayout fullHeight={true}>
                <TaskProvider initialTask={task} correlationId={correlationId}>
                    <TaskContainer
                        taskInfoLink={taskInfoLink}
                        nigoExceptions={nigoExceptions}
                        nigoSubExceptions={nigoSubExceptions}
                        taskMetadata={taskMetadata}
                    />
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
        const taskTypeOverride = (query.taskTypeOverride as string) || '';
        const taskUserOverride = Boolean(query.taskUserOverride) || false;

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
            const mockedTaskType = taskTypeOverride && !isProd() && taskTypeOverride;
            const task = await getCaseTaskById(taskId, accessToken, mockedTaskType as TaskType);

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

            if (!taskType || !carrier || !caseId || !process) {
                logWarn('task/details not found', { taskType, carrier, caseId, process });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }
            if (!(taskUserOverride === true && !isProd())) {
                if (
                    !(
                        user.email &&
                        ((task.assignee && task.assignee.toLowerCase() == user.email.toLowerCase()) ||
                            (!task.assignee && task.prefferedAssignee && task.prefferedAssignee.toLowerCase() == user.email.toLowerCase()))
                    )
                ) {
                    logWarn('task/:id::task is not assigned to user', { assignee: task.assignee, user: user.email });
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
                const isTaskEnabled = await optimizelyService.getFeatureFlagVariables(
                    FEATURE_FLAG_VARIABLES.TASK_MANAGEMENT,
                    carrier?.toLowerCase(),
                    user.sub
                );
                const flag = convertToCamelCase(taskType);
                const enabledTask = Object.keys(isTaskEnabled).includes(flag);
                if (!enabledTask) {
                    logWarn('task/:id::feature flag not enabled', { carrier });
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
            }

            const nigoFilters = {
                categoryIds: ['Form', 'Signature', 'Account Information'],
                carrier: carrier?.toUpperCase(),
                process: taskType,
            };

            const [translations, caseDetails, nigoExceptionResponse, taskMetadata] = await Promise.all([
                await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS], nextI18nextConfig, ALL_LOCALES),
                await getCaseDetailsSSR(caseId, accessToken as string),
                await getNigoExceptions(nigoFilters, accessToken),
                await getTaskFormMetadata(carrier, taskType as TaskType, process as ProcessType, accessToken),
            ]);

            const correlationId = caseDetails?.correlationId;

            const currentTaskMetadata = taskMetadata?.schemaContent?.tabSchemas || ([] as FormMetadata[]);

            const { nigoExceptions, nigoSubExceptions } = nigoExceptionResponse;

            const taskInfoLink = buildCaseLink(caseId);

            //transform schema options with api
            await applyDynamicOptions(task, accessToken, currentTaskMetadata);

            return {
                props: {
                    ...translations,
                    taskMetadata: TaskMetadataHelper(task, currentTaskMetadata),
                    task,
                    correlationId,
                    taskInfoLink,
                    nigoExceptions,
                    nigoSubExceptions,
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
