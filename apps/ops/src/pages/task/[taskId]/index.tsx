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
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskById } from '@deps/operations/tasks/task-operations';
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

            const task: ManagementTask = {
                id: 'TA000000016146',
                caseId: 'CA0000383347',
                process: 'New Business',
                carrier: 'WELB',
                taskType: 'PURCHASE_DOCUMENT_MATCHING',
                taskName: 'Suitability Review',
                status: TaskStatus.New,
                data: {
                    details: {
                        amount: '10000',
                        payerDetails: {
                            firstName: '',
                            lastName: '',
                            payorName: 'New Finance Group',
                            taxId: 'ssn123456',
                            type: 'payment',
                            roles: 'Annuitant, Insured',
                        },
                        purchaseDocument: [
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
                            entityType: 'NB_APPLICATION_DATA',
                            recordId: '545435345435532',
                            zlCaseId: '1111111',
                            policyNumber: '22222222',
                            taxId: 'ssn123456',
                            firstName: 'AA',
                            lastName: 'BB',
                            correlationId: '06de7ad7-7071-4f1f-bd90-dd0ee2ca0c29',
                        },
                        {
                            entityType: 'RMD_APP_DATA',
                            recordId: '456545654',
                            zlCaseId: '86878787',
                            policyNumber: '685878876',
                            taxId: 'ssn8888456',
                            firstName: 'uuuu',
                            lastName: 'ggggg',
                            correlationId: '06de7ad7-7071-4f1f-bd90-dd0ee2ca0c28',
                        },
                        {
                            entityType: 'NB_APPLICATION_DATA',
                            recordId: '2312313213132',
                            zlCaseId: '4444444',
                            policyNumber: '555555',
                            taxId: 'ssn34234',
                            firstName: 'CC',
                            lastName: 'DD',
                            correlationId: '06de7ad7-7071-4f1f-bd90-dd0ee2ca0c30',
                        },
                    ],
                    payments: [],
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

            if (!isFormFeatureEnabled(taskType as TaskType, carrier, featureFlagDecisions)) {
                logWarn('task/:id::feature flag not enabled', { carrier });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const taskMetadata = [
                {
                    formId: '004c97a1-d97c-4faa-9b7f-8ff9105b4c29',
                    process: 'IndexationOrkestr',
                    carrier: 'WELB',
                    taskType: 'PURCHASE_DOCUMENT_MATCHING',
                    title: 'Match Document',
                    formSchema: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',
                        definitions: {
                            caseTypeEnum: {},
                            caseSubTypeEnum: {},
                        },
                        properties: {
                            sectionHeader: {
                                type: 'object',
                                title: 'Processing Instructions',
                            },

                            details: {
                                type: 'object',
                                title: 'Details',
                                properties: {
                                    amount: {
                                        type: 'string',
                                        title: 'Amount Received',
                                    },
                                    payerDetails: {
                                        type: 'object',
                                        title: 'Supporting information',
                                        properties: {
                                            payorName: {
                                                type: 'string',
                                                title: 'Title',
                                            },
                                            taxId: {
                                                type: 'string',
                                                title: 'SSN',
                                            },
                                            roles: {
                                                type: 'string',
                                                title: 'Role(s)',
                                            },
                                        },
                                        additionalProperties: true,
                                    },
                                    purchaseDocument: {
                                        type: 'array',
                                        title: '',
                                        items: {
                                            type: 'object',
                                            title: '',
                                            properties: {
                                                documentName: {
                                                    type: 'string',
                                                },
                                                documentId: {
                                                    type: 'string',
                                                },
                                                documentSource: {
                                                    type: 'string',
                                                },
                                                createdDate: {
                                                    type: 'string',
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
                                            const: 'enterCaseId',
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
                                else: {
                                    if: {
                                        properties: {
                                            potentialMatches: {
                                                const: 'notMatched',
                                            },
                                        },
                                    },
                                    then: {
                                        properties: {
                                            caseType: {
                                                type: 'string',
                                                title: 'Cases',
                                                $ref: '#/definitions/caseTypeEnum',
                                            },
                                            caseSubType: {
                                                type: 'string',
                                                title: 'Case Types',
                                                $ref: '#/definitions/caseSubTypeEnum',
                                            },
                                        },
                                    },
                                    else: {
                                        properties: {
                                            isDuplicate: {
                                                type: 'string',
                                                title: 'Is this document a duplicate?',
                                                enum: ['Yes', 'No'],
                                            },
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
                            payerDetails: {
                                'ui:options': {
                                    cardType: 'Detailed',
                                    icon: 'CIRCLE_USER',
                                    label: true,
                                    ObjectFieldTemplate: 'CardTemplate',
                                    sectionTitle: 'Details',
                                },
                            },
                            purchaseDocument: {
                                canAdd: false,
                                props: {
                                    type: 'Document',
                                    canAdd: false,
                                },
                                'ui:options': {
                                    label: false,
                                },
                                items: {
                                    props: {
                                        readonly: true,
                                    },
                                    'ui:options': {
                                        canAdd: false,
                                        label: false,
                                        cardType: 'Document',
                                        icon: 'DOCUMENT_TEXT',
                                        ObjectFieldTemplate: 'CardTemplate',
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
                                        value: 'enterCaseId',
                                    },
                                    {
                                        label: 'Document cannot be matched to a case',
                                        value: 'notMatched',
                                    },
                                ],
                            },
                        },
                        caseId: {
                            'ui:options': {
                                label: true,
                            },
                        },
                        caseType: {
                            'ui:widget': 'SelectWidget',
                            'ui-options': {
                                label: true,
                            },
                            'ui:props': {
                                apiUrl: 'case/v1/refdata',
                                apiPayload: {
                                    carrier: ['WELB'],
                                    keys: ['requestSubType'],
                                    process: ['{{value}}'],
                                },
                                apiMethod: 'post',
                                responseKey: 'caseSubTypes',
                                responseData: '{{data.referenceData.requestSubType}}',
                            },
                        },
                        caseSubType: {
                            'ui:widget': 'SelectWidget',
                            'ui-options': {
                                label: true,
                            },
                        },

                        isDuplicate: {
                            'ui:widget': 'radio',
                        },
                    },
                },
                {
                    formId: '004c97a1-d97c-4faa-9b7f-8ff9105b4c29',
                    process: 'IndexationOrkestr',
                    carrier: 'WELB',
                    taskType: 'PURCHASE_DOCUMENT_MATCHING',
                    title: 'Match Payment',

                    formSchema: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',

                        properties: {
                            sectionHeader: {
                                type: 'object',
                                title: 'Processing Instructions',
                            },

                            details: {
                                type: 'object',
                                title: 'Details',
                                properties: {
                                    amount: {
                                        type: 'string',
                                        title: 'Amount Received',
                                    },
                                    payerDetails: {
                                        type: 'object',
                                        title: 'Supporting information',
                                        properties: {
                                            payorName: {
                                                type: 'string',
                                                title: 'Title',
                                            },
                                            taxId: {
                                                type: 'string',
                                                title: 'SSN',
                                            },
                                        },
                                    },
                                    purchaseDocument: {
                                        type: 'array',
                                        title: '',
                                        items: {
                                            type: 'object',
                                            title: '',
                                            properties: {
                                                documentName: {
                                                    type: 'string',
                                                },
                                                documentId: {
                                                    type: 'string',
                                                },
                                                documentSource: {
                                                    type: 'string',
                                                },
                                                createdDate: {
                                                    type: 'string',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            transactions: {
                                type: 'string',
                                title: 'Select exchange record',
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
                            props: {
                                description: 'Match the received payment to the appropriate exchange record information.',
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
                            payerDetails: {
                                'ui:options': {
                                    cardType: 'Detailed',
                                    icon: 'CIRCLE_USER',
                                    label: true,
                                    ObjectFieldTemplate: 'CardTemplate',
                                    sectionTitle: 'Details',
                                },
                            },
                            purchaseDocument: {
                                canAdd: false,
                                props: {
                                    type: 'Document',
                                    canAdd: false,
                                },
                                'ui:options': {
                                    label: false,
                                },
                                items: {
                                    props: {
                                        readonly: true,
                                    },
                                    'ui:options': {
                                        canAdd: false,
                                        label: false,
                                        cardType: 'Document',
                                        icon: 'DOCUMENT_TEXT',
                                        ObjectFieldTemplate: 'CardTemplate',
                                    },
                                },
                            },
                        },
                        transactions: {
                            'ui:widget': 'radio',
                            'ui:options': {
                                label: false,
                                customOptions: [
                                    {
                                        label: 'Enter a case ID',
                                        value: 'enterCaseId',
                                    },
                                    {
                                        label: 'Document cannot be matched to a case',
                                        value: 'notMatched',
                                    },
                                ],
                            },
                        },
                    },
                },
            ];

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
                console.log('🚀 ~ getServerSideProps: ~ caseTypeOptions:', caseTypeOptions?.referenceData.processList);

                if (taskMetadata[0].formSchema.definitions) {
                    taskMetadata[0].formSchema.definitions.caseTypeEnum = {
                        enum: caseTypeOptions?.referenceData.processList || ['Case Type Not Found'],
                    };
                }
            }

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
