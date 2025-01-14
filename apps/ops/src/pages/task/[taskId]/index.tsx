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
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskById } from '@deps/operations/tasks/task-operations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import { TaskMetadataHelper } from '@deps/utils/tasks/task-metadata-helper';
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
    console.log('🚀 ~ taskMetadata:', taskMetadata.formSchema.allOf);
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

        //const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);

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

            const task: ManagementTask = {
                id: 'TA000000016146',
                caseId: 'CA0000383347',
                process: 'New Business',
                carrier: 'WELB',
                taskType: 'NB_LINK_PAYMENT_POLICY',
                taskName: 'Suitability Review',
                status: TaskStatus.New,
                data: {
                    details: {
                        amount: '10000 $',
                        documentMatcher: {
                            firstName: '',
                            lastName: '',
                            payorName: 'New Finance Group',
                            taxId: 'ssn123456',
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
                    },
                    potentialMatches: [
                        {
                            applicationId: 'app1',
                            zlCaseId: '',
                            policyNumber: '',
                            taxId: 'ssn123456',
                            firstName: '',
                            lastName: '',
                            processSubtype: '',
                            label: 'app1',
                            url: '/cases/CA0000371344',
                            value: 'CA0000371344',
                            type: 'link',
                        },
                        {
                            applicationId: 'app2',
                            zlCaseId: '',
                            policyNumber: '',
                            taxId: 'ssn123456',
                            firstName: '',
                            lastName: '',
                            processSubtype: '',
                            label: 'app2',
                            url: '/cases/CA0000383413',
                            value: 'CA0000383413',
                            type: 'link',
                        },
                        {
                            applicationId: 'app3',
                            zlCaseId: '',
                            policyNumber: '',
                            taxId: 'ssn123456',
                            firstName: '',
                            lastName: '',
                            processSubtype: '',
                            label: 'app3',
                            url: '/cases/CA0000367910',
                            value: 'CA0000367910',
                            type: 'link',
                        },
                    ],
                },
                queue: 'new_business_suitability_review',
                createdAt: '2024-12-30T07:06:39Z',
                updatedAt: '2024-12-30T07:06:39Z',
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

            const { taskType, carrier, caseId } = task;
            const caseDetails = await getCaseDetailsSSR(caseId, accessToken as string);
            const correlationId = caseDetails?.correlationId; // Access the property using optional chaining

            // If feature flag is not enabled, redirect to error page
            //    todo:enable feature flag
            // if (!isFormFeatureEnabled(taskType as TaskType, carrier, featureFlagDecisions)) {
            //     logWarn('task/:id::feature flag not enabled', { carrier });
            //     return {
            //         redirect: {
            //             destination: '/403',
            //             permanent: false,
            //         },
            //     };
            // }

            //   const taskMetadata = await getTaskFormMetadata(carrier, taskType as TtaskFormaskType, process as ProcessType, accessToken);

            const taskMetadata = {
                formId: '004c97a1-d97c-4faa-9b7f-8ff9105b4c29',
                process: 'New Business',
                carrier: 'WELB',
                taskType: 'SUITABILITY_REVIEW',
                title: 'Match Document',
                formSchema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    definitions: {
                        potentialMatchesEnum: {
                            oneOf: [
                                {
                                    const: 'Enter a case ID',
                                    title: 'Enter a case ID',
                                },
                                {
                                    const: 'Document cannot be matched to a case',
                                    title: 'Document cannot be matched to a case',
                                },
                            ],
                        },
                    },
                    properties: {
                        sectionHeader: {
                            type: 'object',
                            title: 'Processing Instructions',
                            // todo:vijaya: fix description
                            // description:
                            //    "This customer's application was flagged for review. Accept or Decline each issue before submitting a final decision.",
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
                                    default: '/cases',
                                },
                            },
                        },
                        potentialMatches: {
                            type: 'string',
                            title: 'Can you find a matching case for this document?',
                        },
                    },
                    allOf: [
                        {
                            if: {
                                properties: {
                                    potentialMatches: {
                                        const: 'Enter a case ID',
                                    },
                                },
                            },
                            then: {
                                properties: {
                                    caseId: {
                                        type: 'string',
                                        title: 'Case Id',
                                    },
                                },
                            },
                        },
                        {
                            if: {
                                properties: {
                                    potentialMatches: {
                                        const: 'Document cannot be matched to a case',
                                    },
                                },
                            },
                            then: {
                                properties: {
                                    canceled: {
                                        type: 'string',
                                        title: 'Case Id',
                                        enum: ['yes', 'no'],
                                    },
                                },
                            },
                        },
                    ],
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
                        props: {
                            description:
                                "This customer's application was flagged for review. Accept or Decline each issue before submitting a final decision.",
                        },
                        'ui:options': {
                            label: true,
                            ObjectFieldTemplate: 'InstructionsTemplate',
                        },
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
                                cardType: 'Detailed',
                                icon: 'CIRCLE_USER',
                                label: true,
                                ObjectFieldTemplate: 'CardTemplate',
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
                    potentialMatches: {
                        'ui:widget': 'radio',
                        'ui:options': {
                            label: true,
                            customOptions: [
                                {
                                    label: 'Enter a case ID',
                                    value: 'Enter a case ID',
                                },
                                {
                                    label: 'Document cannot be matched to a case',
                                    value: 'Document cannot be matched to a case',
                                },
                            ],
                        },
                    },
                    // testing: {
                    //     'ui:options': {
                    //         label: false,
                    // disabled: (task: any) =>
                    //     task.data.potentialMatches !== 'Enter a case ID' ||
                    //     task.data.potentialMatches != 'Document cannot be matched to a case',
                    //     },
                    // },
                    caseId: {
                        'ui:options': {
                            label: true,
                        },
                    },
                    canceled: {
                        widget: 'radio',
                    },
                    isDuplicate: {
                        'ui:widget': 'radio',
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
                    taskMetadata: TaskMetadataHelper(task, taskMetadata),
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
