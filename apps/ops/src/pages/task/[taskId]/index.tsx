import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import TaskContainer from '@deps/containers/task-container/task-container';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { ProcessType } from '@deps/models/case/enums';
import { TaskType } from '@deps/models/case/task';
import { UserPermission } from '@deps/models/user-profile';
import { getTaskFormMetadataSSR } from '@deps/queries/api/v1/task';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type TaskPageProps = {
    caseId: string;
    taskId: string;
    taskType: TaskType;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    taskData: any;
};

export const TaskPage: React.FC<TaskPageProps> = ({ caseId, taskId, taskType, formSchema, uiSchema, taskData }: TaskPageProps) => {
    const [isLoading] = useState(false);
    return isLoading ? (
        <></>
    ) : (
        <div>
            <PageHead titleKey="caseOverview" />
            <NoNavLayout fullHeight={true}>
                <TaskContainer
                    caseId={caseId ?? ''}
                    taskId={taskId ?? ''}
                    taskType={taskType ?? ''}
                    taskData={taskData ?? {}}
                    formSchema={formSchema}
                    uiSchema={uiSchema}
                />
            </NoNavLayout>
        </div>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: any) => {
        const user = await getUserData(context);

        const { locale = DEFAULT_LOCALE, query, req, res } = context;

        const taskId = (query.taskId as string) || '';
        const processType = (query.processType as ProcessType) || '';

        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('getServerSidePropsNigoEntryPage::Access token expired', {
                ...parseErrorInformation(e),
                file: 'pages/suitability',
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
                logError('suitability::Error getting task by id', {
                    taskId,
                    file: 'pages/task',
                    function: 'getServerSideProps',
                });
                // return {
                //     redirect: {
                //         destination: `task/:id/error?errorCode=${ERROR_CODES.WITHDRAWAL_TASK_INITIALIZATION}`,
                //         permanent: false,
                //     },
                // };
            }

            const { carrier, taskType, data } = task || {};
            const taskFormSchema = await getTaskFormMetadataSSR(carrier || '', taskType as TaskType, processType);

            const { formSchema, uiSchema } = taskFormSchema ?? {};
            return {
                props: {
                    ...translations,
                    taskId,
                    taskType,
                    formSchema,
                    uiSchema,
                    taskData: data,
                },
            };
        } catch (error) {
            logError('getServerSidePropsNigoEntryPage', { ...parseErrorInformation(error) });
            return {
                props: {},
            };
        }
    },
});

export default TaskPage;
