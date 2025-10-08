import { getAccessToken } from '@auth0/nextjs-auth0';
import { convertToCamelCase } from '@zinnia/utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { getNigoExceptions } from '@deps/containers/task-container/components/steps/nigo-details/nigo-details.helpers';
import TaskContainer from '@deps/containers/task-container/task-container';
import { applyDynamicOptions } from '@deps/containers/task-container/task-handlers/handle-task';
import { TaskProvider } from '@deps/containers/task-container/task-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { ProcessType } from '@deps/models/case/enums';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import {
    getCaseTaskById,
    getTaskFormMetadata,
} from '@deps/operations/tasks/task-operations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { isProd } from '@deps/utils/environment.helpers';
import { getFeatureFlagByKey } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
import {
    logError,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import { TaskMetadataHelper } from '@deps/utils/tasks/task-metadata-helpers';
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
            const taskSchemaOverride =
                (query.taskSchemaOverride as string) || '';
            const carrierOverride = (query.taskCarrierOverride as string) || '';

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

            const hasPermissionToReadCaseManagement =
                await doesUserHavePagePermissions(
                    context,
                    UserPermission.AllowReadCaseManagement,
                    loggingContext
                );
            if (!hasPermissionToReadCaseManagement) {
                logError('Task:: access denied', {
                    ...loggingContext,
                    taskId,
                });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            try {
                const mockedTaskType =
                    taskTypeOverride && !isProd() && taskTypeOverride;

                const task = await getCaseTaskById(
                    taskId,
                    accessToken,
                    loggingContext,
                    mockedTaskType as TaskType,
                    carrierOverride
                );

                if (!task) {
                    logError('Task::Error getting task by id', {
                        ...loggingContext,
                        taskId,
                    });
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
                    logWarn('task/details not found', {
                        ...loggingContext,
                        taskType,
                        carrier,
                        caseId,
                        process,
                    });
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
                if (
                    !(
                        !isProd() &&
                        (taskUserOverride ||
                            taskTypeOverride ||
                            taskSchemaOverride)
                    )
                ) {
                    if (
                        !(
                            user.partyId &&
                            task.assigneePartyId &&
                            task.assigneePartyId === user.partyId
                        )
                    ) {
                        if (task.status !== TaskStatus.Completed) {
                            logWarn('task/:id::task is not assigned to user', {
                                ...loggingContext,
                                assignee: task.assignee,
                            });
                            return {
                                redirect: {
                                    destination: '/403',
                                    permanent: false,
                                },
                            };
                        }
                    }
                    const enabledTask = await getFeatureFlagByKey(
                        FEATURE_FLAG_VARIABLES.TASK_MANAGEMENT,
                        carrier?.toLowerCase(),
                        flag,
                        user.sub,
                        loggingContext
                    );

                    if (!enabledTask) {
                        logWarn('task/:id::feature flag not enabled', {
                            ...loggingContext,
                            carrier,
                        });
                        return {
                            redirect: {
                                destination: '/403',
                                permanent: false,
                            },
                        };
                    }
                }

                let [isSaveAsDraftEnabled, isContinueButtonEnabled] =
                    await Promise.all([
                        getFeatureFlagByKey(
                            FEATURE_FLAG_VARIABLES.TASK_SAVE_AS_DRAFT,
                            carrier?.toLowerCase(),
                            flag,
                            user.sub,
                            loggingContext
                        ),
                        getFeatureFlagByKey(
                            FEATURE_FLAG_VARIABLES.TASK_CONTINUE_BUTTON_ENABLE,
                            carrier?.toLowerCase(),
                            flag,
                            user.sub,
                            loggingContext
                        ),
                    ]);

                isSaveAsDraftEnabled =
                    task?.status !== TaskStatus.Completed &&
                    isSaveAsDraftEnabled;
                isContinueButtonEnabled =
                    isContinueButtonEnabled ||
                    task?.status === TaskStatus.Completed;

                const nigoFilters = {
                    categoryIds: ['Form', 'Signature', 'Account Information'],
                    carrier: carrier?.toUpperCase(),
                    process: taskType,
                };

                const mockedSchema = taskSchemaOverride === 'true' && !isProd();
                const [
                    translations,
                    caseDetails,
                    nigoExceptionResponse,
                    taskMetadata,
                ] = await Promise.all([
                    await serverSideTranslations(
                        locale,
                        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                        nextI18nextConfig,
                        ALL_LOCALES
                    ),
                    await getCaseDetailsSSR(
                        caseId,
                        accessToken as string,
                        loggingContext
                    ),
                    await getNigoExceptions(
                        nigoFilters,
                        accessToken,
                        loggingContext
                    ),
                    await getTaskFormMetadata(
                        carrier,
                        taskType as TaskType,
                        process as ProcessType,
                        accessToken,
                        loggingContext,
                        mockedSchema
                    ),
                ]);

                const correlationId = caseDetails?.correlationId;

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

                const { nigoExceptions, nigoSubExceptions } =
                    nigoExceptionResponse;

                const taskInfoLink = context?.req?.headers?.referer
                    ? new URL(context.req.headers.referer)?.pathname
                    : '/home';

                //transform schema options with api
                await applyDynamicOptions(
                    task,
                    accessToken,
                    currentTaskMetadata,
                    loggingContext
                );
                const updatedTaskMetadata = await TaskMetadataHelper(
                    task,
                    currentTaskMetadata,
                    accessToken as string,
                    loggingContext
                );

                return {
                    props: {
                        ...translations,
                        taskMetadata: updatedTaskMetadata,
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
                logError('getServerSidePropsTask', {
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
        file: 'pages/task/[taskId]/index',
        function: 'getServerSideProps',
        page: 'task/:taskId',
    }
);

export default TaskPage;
