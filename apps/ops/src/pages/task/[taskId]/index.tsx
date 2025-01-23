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
            const [translations, task] = await Promise.all([
                await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS], nextI18nextConfig, ALL_LOCALES),
                await getCaseTaskById(taskId, accessToken),
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
            const taskMetadata = {
                formId: 'c0c1c9b9-741b-4272-8cf4-48cd0d7cb0f2',
                process: 'Qualification',
                carrier: 'WELB',
                taskType: 'PURCHASE_DOCUMENT_MATCHING',
                formSchema: {
                    allOf: [
                        {
                            if: {
                                properties: {
                                    potentialMatches: {
                                        const: 'ENTERED',
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
                                        const: 'REINDEX',
                                    },
                                },
                            },
                            then: {
                                properties: {
                                    caseType: {
                                        type: 'string',
                                        title: 'Cases',
                                    },
                                    caseSubType: {
                                        type: 'string',
                                        title: 'Case',
                                    },
                                },
                            },
                        },
                    ],
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    properties: {
                        sectionHeader: {
                            type: 'object',
                            title: 'Processing Instruction',
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
                                    additionalProperties: true,
                                },
                                purchaseDocument: {
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
                },
                uiSchema: {
                    'ui:globalOptions': {
                        duplicateKeySuffixSeparator: '_',
                        orderable: false,
                        copyable: false,
                    },
                    'ui:submitButtonOptions': {
                        norender: true,
                    },
                    sectionHeader: {
                        props: {
                            description:
                                'Review supporting information and determine if the document can be matched to an existing case. Search all cases and review any suggested potential matches. Confirm the matching Case ID, if possible.',
                        },
                        'ui:options': {
                            label: true,
                            ObjectFieldTemplate: 'InstructionsTemplate',
                        },
                    },
                    caseId: {
                        'ui:options': {
                            label: true,
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
                            },
                        },
                        purchaseDocument: {
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
                            cardType: 'Link',
                            customOptions: [
                                {
                                    label: 'Enter a case ID',
                                    value: 'ENTERED',
                                },
                                {
                                    label: 'Document cannot be matched to a case',
                                    value: 'REINDEX',
                                },
                            ],
                        },
                    },
                    isDuplicate: {
                        'ui:widget': 'radio',
                    },
                },
                schemaContent: {
                    tabSchemas: [
                        {
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
                                                        dataType: 'ssn',
                                                    },
                                                    roles: {
                                                        type: 'string',
                                                        title: 'Role(s)',
                                                    },
                                                },
                                                additionalProperties: true,
                                            },
                                            purchaseDocument: {
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
                                                    carrier: {
                                                        type: 'string',
                                                        default: '{{carrier}}',
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
                                                    const: 'ENTERED',
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
                                                        const: 'REINDEX',
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
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                'ui:submitButtonOptions': {
                                    norender: true,
                                },
                                sectionHeader: {
                                    props: {
                                        description:
                                            'Review supporting information and determine if the document can be matched to an existing case. Search all cases and review any suggested potential matches. Confirm the matching Case ID, if possible.',
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
                                        'ui-widget': 'ValueWidget',
                                        'ui:options': {
                                            label: false,
                                            inline: true,
                                            prefix: '$',
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
                                        cardType: 'Link',
                                        label: true,
                                        customOptions: [
                                            {
                                                label: 'Enter a case ID',
                                                value: 'ENTERED',
                                            },
                                            {
                                                label: 'Document cannot be matched to a case',
                                                value: 'REINDEX',
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
                                            carrier: ['{{carrier}}'],
                                            keys: ['requestSubType'],
                                            process: ['{{value}}'],
                                        },
                                        apiMethod: 'post',
                                        responseKey: 'caseSubTypeOptions',
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
                                    'ui:options': {
                                        customOptions: [
                                            {
                                                label: 'Yes',
                                                value: 'DUPLICATE',
                                            },
                                            {
                                                label: 'No',
                                                value: 'MATCH_FOUND',
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                        {
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
                                                        dataType: 'ssn',
                                                    },
                                                },
                                            },
                                            purchaseDocument: {
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
                                                    carrier: {
                                                        type: 'string',
                                                        default: '{{carrier}}',
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
                                        'ui-widget': 'ValueWidget',
                                        'ui:options': {
                                            label: false,
                                            inline: true,
                                            prefix: '$',
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
                                transactions: {
                                    "ui:widget'": 'radio',
                                    'ui:options': {
                                        cardType: 'Detailed',
                                        icon: 'BANK',
                                        label: false,
                                        sectionTitle: 'Details',
                                        properties: {
                                            companyName: {
                                                type: 'string',
                                                title: 'Company name',
                                                default: '{{entity.payment.exchangeReplace.companyName}}',
                                            },
                                            transferAmount: {
                                                type: 'string',
                                                title: 'Expected transfer amount',
                                                default: '{{entity.payment.exchangeReplace.amountRequested}}',
                                            },
                                            paymentRecordId: {
                                                type: 'string',
                                                title: 'Payment Record Id',
                                                default: '{{entity.paymentRecordId}}',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            };

            const currentTaskMetadata = taskMetadata?.schemaContent?.tabSchemas || [];

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
