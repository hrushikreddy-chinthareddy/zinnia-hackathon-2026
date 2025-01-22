import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
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
import { ProcessType } from '@deps/models/case/enums';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskById, getTaskFormMetadata } from '@deps/operations/tasks/task-operations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getCaseDetailsSSR, getReferenceDataSSR } from '@deps/queries/api/cases';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import { TaskMetadataHelper } from '@deps/utils/tasks/task-metadata-helper';
import nextI18nextConfig from 'next-i18next.config';

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
    console.log('🚀 ~ task:', task);

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
            const [translations] = await Promise.all([
                await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS], nextI18nextConfig, ALL_LOCALES),
                await getCaseTaskById(taskId, accessToken),
            ]);

            const task = {
                id: 'TA000000017049',
                caseId: 'CA0000386733',
                source: 'BPM.IndexationOrkestr',
                templateId: '1f802f29-b4e0-4a4b-9923-ba63a1bde55b',
                process: 'Qualification',
                carrier: 'WELB',
                taskType: 'PURCHASE_DOCUMENT_MATCHING',
                taskName: 'Match Document',
                status: TaskStatus.New,
                data: {
                    details: {
                        caseOverview: '/cases',
                        amount: '2843.13',
                        payerDetails: {
                            taxId: '832902950',
                        },
                        purchaseDocument: {
                            documentSource: 'EDS',
                        },
                    },
                    potentialMatches: [
                        {
                            transactionType: 'New Business',
                            zlCaseId: '1234',
                            policyNumber: 'ADA00012',
                            taxId: 'SSN000111',
                            firstName: 'Test',
                            lastName: 'Test',
                        },
                        {
                            transactionType: 'Renewals',
                            zlCaseId: '1233',
                            policyNumber: 'ADA00015',
                            taxId: 'SSN000111',
                            firstName: 'Test1',
                            lastName: 'Test2',
                        },
                    ],
                    caseType: 'Qualification',
                },
                mappedExceptions: [],
                mappedDocuments: [],
                queue: 'qualification',
                escalated: false,
                createdBy: 'SYSTEM',
                createdByPartyId: 'SYSTEM',
                createdAt: '2025-01-21T13:24:07Z',
                updatedBy: 'Vijayalaxmi.Sambhane@zinnia.com',
                updatedByPartyId: 'fa49a69c3939412d87b315cb39459497',
                updatedAt: '2025-01-22T13:09:35Z',
                identifiers: [
                    {
                        identifier: 'correlationid',
                        value: '1e1819e9-2e45-4703-9b3a-e8c9ac111168',
                    },
                    {
                        identifier: 'zlCaseId',
                        value: 'CA0000386733',
                    },
                ],
                externalId: 'aa5fceed-f3a4-4b9a-a348-4c7d5003fcc5',
            };

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
            const caseDetails = await getCaseDetailsSSR(caseId, accessToken as string);
            const correlationId = caseDetails?.correlationId; // Access the property using optional chaining

            console.log(
                '🚀 ~ getServerSideProps: ~ isFormFeatureEnabled(taskType as TaskType, carrier, featureFlagDecisions):',
                isFormFeatureEnabled(taskType as TaskType, carrier, featureFlagDecisions)
            );

            if (!isFormFeatureEnabled(taskType as TaskType, carrier, featureFlagDecisions)) {
                logWarn('task/:id::feature flag not enabled', { carrier });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }
            const taskMetadata = await getTaskFormMetadata(carrier, taskType as TaskType, process as ProcessType, accessToken);

            const currentTaskMetadata: FormMetadata[] = taskMetadata?.schemaContent?.tabSchemas || [];

            if (!currentTaskMetadata.length) {
                const fallbackMetadata: FormMetadata = {
                    title: '',
                    formSchema: taskMetadata?.formSchema ?? {},
                    uiSchema: taskMetadata?.uiSchema ?? {},
                };
                currentTaskMetadata.push(fallbackMetadata);
            }

            const nigoFilters = {
                categoryIds: ['Form', 'Signature', 'Account Information'],
                carrier: carrier?.toUpperCase(),
                process: taskType,
            };

            const nigoExceptionResponse = await getNigoExceptions(nigoFilters, accessToken);
            const { nigoExceptions, nigoSubExceptions } = nigoExceptionResponse;
            const taskInfoLink = buildCaseLink(caseId);
            if (task.taskType === TaskType.PURCHASE_DOCUMENT_MATCHING) {
                const filters = {
                    carrier: [task.carrier],
                    keys: ['processList'] as ('processList' | 'requestSubType' | 'productName')[],
                };

                const caseTypeOptions = await getReferenceDataSSR(filters, accessToken);

                if (currentTaskMetadata[0]?.formSchema?.definitions) {
                    currentTaskMetadata[0].formSchema.definitions.caseTypeEnum = {
                        enum: caseTypeOptions?.referenceData.processList || ['Case Type Not Found'],
                    };
                }
            }

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
