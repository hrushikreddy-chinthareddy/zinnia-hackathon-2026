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
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskById } from '@deps/operations/tasks/task-operations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type TaskPageProps = {
    task: ManagementTask;
    taskMetadata: FormMetadata;
    correlationId: string;
    taskInfoLink: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
};

export const TaskPage: React.FC<TaskPageProps> = ({
    task,
    taskMetadata,
    taskInfoLink,
    correlationId,
    nigoExceptions,
    nigoSubExceptions,
}: TaskPageProps) => {
    console.log('🚀 ~ taskInfoLink:', taskInfoLink);
    return (
        <div>
            <NoNavLayout fullHeight={true}>
                <TaskProvider taskMetadata={taskMetadata} initialTask={task} correlationId={correlationId}>
                    <TaskContainer taskInfoLink={taskInfoLink} nigoExceptions={nigoExceptions} nigoSubExceptions={nigoSubExceptions} />
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
                id: 'TA000000016146',
                caseId: 'CA0000383347',
                source: 'BPM.Suitability',
                templateId: '9f4f22da-c7d3-4cb3-bb8f-622df920bdf6',
                process: 'New Business',
                carrier: 'WELB',
                taskType: 'SUITABILITY_REVIEW',
                category: 'Review Task',
                taskName: 'Suitability Review',
                status: 'NEW',
                data: {
                    details: {
                        amount: '2000 $',
                        documentMatcher: {
                            title: 'Financial Objective',
                            subTitle: 'FinancialObjective = Other',
                            name: 'FinancialObjective',
                            dob: 'Date of birth',
                            type: 'payment',
                        },
                        documents: [
                            {
                                documentId: '231hf324ffffsfds3444',
                                documentName: 'Cheque.Pdf',
                                documentSource: 'EDS',
                                createdDate: '2024-11-05T19:57:48.1250188',
                            },
                        ],
                        caseOverview: '/cases',
                    },

                    nigos: ['EX000000003688'],
                },
                mappedExceptions: ['EX000000003688'],
                mappedDocuments: [],
                queue: 'new_business_suitability_review',
                escalated: false,
                createdBy: 'SYSTEM',
                createdByPartyId: 'SYSTEM',
                createdAt: '2024-12-30T07:06:39Z',
                updatedBy: 'SYSTEM',
                updatedByPartyId: 'SYSTEM',
                updatedAt: '2024-12-30T07:06:39Z',
                identifiers: [
                    {
                        identifier: 'applicationId',
                        value: 'WELB04112024001_SS_037',
                    },
                    {
                        identifier: 'zlCaseId',
                        value: 'CA0000383347',
                    },
                ],
                externalId: '4d4311d0-fee7-4930-9c1a-b03857cd2258',
            };

            // task.data['documentMatcher'].push({
            //     title: 'Dyanamic Title',
            //     subTitle: 'Employment Status = Yes and Source of Income = [HOUSEHOLD_WAGE or ALIMONY]',
            //     applicationValue: 'Employment Status is YES and Source of Income is [HOUSEHOLD_WAGE or ALIMONY]',
            //     nmid: 'SU.EM.031',
            //     externalId: '3e3c7b9f-4677-4ca2-bddc-2c26bca7f8f8',
            // });

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

            // If feature flag is not enabled, redirect to error page
            if (!isFormFeatureEnabled(taskType as TaskType, carrier, featureFlagDecisions)) {
                logWarn('task/:id::feature flag not enabled', { carrier });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            //  const taskMetadata = await getTaskFormMetadata(carrier, taskType as TtaskFormaskType, process as ProcessType, accessToken);

            const taskMetadata = {
                formId: '004c97a1-d97c-4faa-9b7f-8ff9105b4c29',
                process: 'New Business',
                carrier: 'WELB',
                taskType: 'SUITABILITY_REVIEW',
                title: 'Match Document',
                formSchema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',

                    properties: {
                        sectionHeader: {
                            type: 'instructions',
                            title: 'Processing Instructions',
                            subTitle:
                                "This customer's application was flagged for review. Accept or Decline each issue before submitting a final decision.",
                        },
                        details: {
                            type: 'object',
                            title: 'Details',
                            properties: {
                                amount: {
                                    type: 'string',
                                    title: 'Amount Received',
                                },
                                documentMatcher: {
                                    type: 'object',
                                    title: 'Supporting information',
                                    properties: {
                                        title: {
                                            type: 'string',
                                            title: 'Title',
                                        },
                                        subtitle: {
                                            type: 'string',
                                            title: 'Subtitle',
                                        },
                                        name: {
                                            type: 'string',
                                            title: 'Title',
                                        },
                                        dob: {
                                            type: 'string',
                                            title: 'Subtitle',
                                        },
                                    },
                                },
                                documents: {
                                    type: 'array',
                                    title: '',
                                    items: {
                                        type: 'object',
                                        title: '',
                                        properties: {
                                            title: {
                                                type: 'string',
                                                title: 'Title',
                                            },
                                            subtitle: {
                                                type: 'string',
                                                title: 'Subtitle',
                                            },
                                            name: {
                                                type: 'string',
                                                title: 'Title',
                                            },
                                            dob: {
                                                type: 'string',
                                                title: 'Subtitle',
                                            },
                                        },
                                    },
                                },
                                caseOverview: {
                                    type: 'string',
                                    title: 'Open case search',
                                },
                            },
                        },
                    },
                },
                uiSchema: {
                    'ui:globalOptions': {
                        duplicateKeySuffixSeparator: '_',
                        orderable: false,
                        copyable: false,
                    },
                    $schema: 'http: //json-schema.org/draft-07/schema#',

                    'ui:submitButtonOptions': {
                        norender: true,
                    },
                    sectionHeader: {
                        'ui:options': {
                            label: true,
                        },
                        'ui:field': 'instructions',
                    },
                    details: {
                        accord: true,
                        'ui:options': {
                            label: true,
                        },
                        amount: {
                            'ui:options': {
                                disabled: true,
                            },
                        },
                        documentMatcher: {
                            'ui:options': {
                                label: true,
                                ObjectFieldTemplate: 'PartyCardTemplate',
                            },
                        },
                        documents: {
                            canAdd: false,
                            props: {
                                type: 'Document',
                                canAdd: false,
                            },
                            'ui:options': {
                                label: false,
                                ArrayFieldTemplate: 'ArrayFieldTemplate',
                                canAdd: false,
                            },
                            items: {
                                props: {
                                    readonly: true,
                                },
                                'ui:options': {
                                    canAdd: false,
                                    label: false,
                                    ObjectFieldTemplate: 'DocumentCardTemplate',
                                },
                            },
                        },
                        caseOverview: {
                            'ui:options': {
                                label: false,
                                type: 'link',
                            },
                            'ui:widget': 'HyperLinkWidget',
                        },
                    },
                },
            };
            if (!taskMetadata?.formSchema || !taskMetadata?.uiSchema) {
                logError('task::Form schema not found', {
                    taskId,
                    carrier,
                    file: `pages/task/${taskId}/${taskType}`,
                    function: 'getServerSideProps',
                });
            }

            const nigoFilters = {
                categoryIds: ['Form', 'Signature', 'Account Information'],
                carrier: carrier?.toUpperCase(),
                process: taskType,
            };

            const nigoExceptionResponse = await getNigoExceptions(nigoFilters, accessToken);
            const { nigoExceptions, nigoSubExceptions } = nigoExceptionResponse;
            const taskInfoLink = buildCaseLink(caseId);

            return {
                props: {
                    ...translations,
                    taskMetadata,
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
