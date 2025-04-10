import { getAccessToken } from '@auth0/nextjs-auth0';
import { convertToCamelCase } from '@zinnia/utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import NoNavLayout from '@deps/components/no-nav-layout';
import { TranslationFiles } from '@deps/config/translations';
import { getNigoExceptions } from '@deps/containers/task-container/components/steps/nigo-details/nigo-details.helper';
import TaskContainer from '@deps/containers/task-container/task-container';
import { applyDynamicOptions } from '@deps/containers/task-container/task-handlers/handle-task';
import { TaskProvider } from '@deps/containers/task-container/task-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { ProcessType } from '@deps/models/case/enums';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskById, getTaskFormMetadata } from '@deps/operations/tasks/task-operations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { isProd } from '@deps/utils/environment.helper';
import { optimizelyService } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
import { logError, logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import { TaskMetadataHelper } from '@deps/utils/tasks/task-metadata-helper';
import nextI18nextConfig from 'next-i18next.config';

type TaskPageProps = {
    task: ManagementTask;
    taskMetadata: FormMetadata[];
    correlationId: string;
    taskInfoLink: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
    isSaveAsDraftEnabled: any;
    isContinueButtonEnabled: boolean;
};

export const TaskPage: React.FC<TaskPageProps> = ({
    task,
    taskInfoLink,
    correlationId,
    nigoExceptions,
    nigoSubExceptions,
    taskMetadata,
    isSaveAsDraftEnabled,
    isContinueButtonEnabled,
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
                        isSaveAsDraftEnabled={isSaveAsDraftEnabled}
                        isContinueButtonEnabled={isContinueButtonEnabled}
                    />
                </TaskProvider>
            </NoNavLayout>
        </div>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
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
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const hasPermissionToReadCaseManagement = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadCaseManagement,
                loggingContext
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
                const task = await getCaseTaskById(taskId, accessToken, loggingContext, mockedTaskType as TaskType);

                if (!task) {
                    logError('Task::Error getting task by id', loggingContext);
                    return {
                        redirect: {
                            destination: `task/:id/error?errorCode=${ERROR_CODES.SUITABILITY_REVIEW_TASK_INITIALIZATION}`,
                            permanent: false,
                        },
                    };
                }

                const { taskType, carrier, caseId, process } = task;

                const flag = convertToCamelCase(taskType);

                if (!taskType || !carrier || !caseId || !process) {
                    logWarn('task/details not found', { ...loggingContext, taskType, carrier, caseId, process });
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
                if (!(!isProd() && (taskUserOverride || taskTypeOverride))) {
                    if (
                        !(
                            user.email &&
                            ((task.assignee && task.assignee.toLowerCase() == user.email.toLowerCase()) ||
                                (!task.assignee &&
                                    task.prefferedAssignee &&
                                    task.prefferedAssignee.toLowerCase() == user.email.toLowerCase()))
                        )
                    ) {
                        logWarn('task/:id::task is not assigned to user', { ...loggingContext, assignee: task.assignee });
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
                        user.sub,
                        loggingContext
                    );

                    const enabledTask = Object.keys(isTaskEnabled).includes(flag);
                    if (!enabledTask) {
                        logWarn('task/:id::feature flag not enabled', { ...loggingContext, carrier });
                        return {
                            redirect: {
                                destination: '/403',
                                permanent: false,
                            },
                        };
                    }
                }

                const featureFlags = await optimizelyService.getFeatureFlagVariables(
                    FEATURE_FLAG_VARIABLES.TASK_SAVE_AS_DRAFT,
                    carrier?.toLowerCase(),
                    user.sub,
                    loggingContext
                );

                const isSaveAsDraftEnabled = Boolean(featureFlags?.[flag]);

                const continueButtonFeatureFlags = await optimizelyService.getFeatureFlagVariables(
                    FEATURE_FLAG_VARIABLES.TASK_CONTINUE_BUTTON_ENABLE,
                    carrier?.toLowerCase(),
                    user.sub,
                    loggingContext
                );

                const isContinueButtonEnabled = Boolean(continueButtonFeatureFlags?.[flag]);

                const nigoFilters = {
                    categoryIds: ['Form', 'Signature', 'Account Information'],
                    carrier: carrier?.toUpperCase(),
                    process: taskType,
                };

                const [translations, caseDetails, nigoExceptionResponse, taskMetadata] = await Promise.all([
                    await serverSideTranslations(
                        locale,
                        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                        nextI18nextConfig,
                        ALL_LOCALES
                    ),
                    await getCaseDetailsSSR(caseId, accessToken as string, loggingContext),
                    await getNigoExceptions(nigoFilters, accessToken, loggingContext),
                    await getTaskFormMetadata(carrier, taskType as TaskType, process as ProcessType, accessToken, loggingContext),
                ]);

                const correlationId = caseDetails?.correlationId;

                const currentTaskMetadata = taskMetadata?.schemaContent?.tabSchemas || ([] as FormMetadata[]);

                if (!currentTaskMetadata.length) {
                    const fallbackMetadata: FormMetadata = {
                        title: '',
                        formSchema: taskMetadata?.formSchema ?? {},
                        uiSchema: taskMetadata?.uiSchema ?? {},
                    };
                    currentTaskMetadata.push(fallbackMetadata ?? {});
                }

                const { nigoExceptions, nigoSubExceptions } = nigoExceptionResponse;

                const taskInfoLink = context?.req?.headers?.referer ? new URL(context.req.headers.referer)?.pathname : '/home';

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
                        isSaveAsDraftEnabled,
                        isContinueButtonEnabled,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsTask', { ...parseErrorInformation(error), ...loggingContext });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'pages/task/[taskId]/index', function: 'getServerSideProps', page: 'task/:taskId' }
);

export default TaskPage;
