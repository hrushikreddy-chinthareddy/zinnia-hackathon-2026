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
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseTaskById } from '@deps/operations/tasks/task-operations';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { optimizelyService } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
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

            const taskMetadata = {
                formId: '004c97a1-d97c-4faa-9b7f-8ff9105b4c29',
                process: 'New Business',
                carrier: 'WELB',
                taskType: 'SUITABILITY_REVIEW',
                title: '',
                formSchema: {
                    type: 'object',
                    properties: {
                        documentCategory: {
                            type: 'array',
                            items: {
                                type: {
                                    title: 'DOCUMENT_CATEGORY',
                                    type: 'string',
                                },
                                key: {
                                    title: 'DOCUMENT_CATEGORY',
                                    type: 'string',
                                },
                                value: {
                                    title: 'DOCUMENT_CATEGORY',
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
                uiSchema: {
                    documentCategory: {
                        'ui:props': {
                            apiUrl: 'case/v1/refdata/DOCUMENT_TYPE?parentKey',
                            apiMethod: 'get',
                            responseKey: 'caseSubTypeOptions',
                            responseData: '{{data.referenceData.requestSubType}}',
                        },
                    },
                },
                schemaContent: {
                    tabSchemas: [
                        {
                            title: 'Review Suitability',
                            formSchema: {
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                type: 'object',
                                definitions: {
                                    suitabilityStatus: {
                                        enum: ['ACCEPT', 'DECLINE'],
                                    },
                                    declineReason: {
                                        enum: [
                                            'SPIF_DECLINED',
                                            'BENEFIT_LOSS',
                                            'LOW_INCOME',
                                            'LOW_ASSETS',
                                            'HIGH_DEBT',
                                            'HIGH_ANNUITY_RATIO',
                                            'LOW_NET_WORTH',
                                            'RECENT_REPLACEMENT',
                                            'MISSING_REQUIREMENTS',
                                            'SURRENDER_FEES',
                                            'TRUST_ISSUE',
                                            'NON_COMPLIANT_INHERITANCE',
                                            'INHERITED_SURRENDER',
                                            'SAME_AGENT_REPLACEMENT',
                                            'AGENT_NO_RESPONSE',
                                            'NON_RESIDENT_SALE',
                                            'TAX_ISSUE',
                                            'NEG_DISPOSABLE_INCOME',
                                            'NEG_NET_WORTH',
                                            'INCOME_GOAL',
                                            'REPLACEMENT_HISTORY',
                                            'UNEMPLOYED',
                                            'NY_RESIDENT',
                                            'ASSISTED_LIVING',
                                            'OVER_ISSUE_AGE',
                                            'OUTSTANDING_LOAN',
                                            'RECENT_ISSUED_REPLACEMENT',
                                            'CONFLICTING_GOALS',
                                            'REVERSE_MORTGAGE',
                                        ],
                                    },
                                    docCategoryEnum: {
                                        enum: ['Death', 'Suitability', 'New Business', 'Agent', 'Post Issue'],
                                    },
                                },
                                properties: {
                                    suitabilityRules: {
                                        type: 'array',
                                        title: '',
                                        items: {
                                            type: 'object',
                                            title: '',
                                            properties: {
                                                issue: {
                                                    type: 'string',
                                                    title: 'Issue',
                                                },
                                                rule: {
                                                    type: 'string',
                                                    title: 'Rule',
                                                },
                                                applicationValue: {
                                                    type: 'string',
                                                    title: 'Additional Info',
                                                },
                                                nmid: {
                                                    type: 'string',
                                                    title: 'Additional Info',
                                                },
                                                externalId: {
                                                    type: 'string',
                                                    title: 'Additional Info',
                                                },
                                            },
                                        },
                                    },
                                    suitabilityReviewStatus: {
                                        type: 'object',
                                        required: ['suitabilityStatus'],
                                        properties: {
                                            suitabilityStatus: {
                                                type: 'string',
                                                title: 'Suitability decision',
                                                $ref: '#/definitions/suitabilityStatus',
                                                default: 'ACCEPT',
                                            },
                                        },
                                        allOf: [
                                            {
                                                if: {
                                                    properties: {
                                                        suitabilityStatus: {
                                                            const: 'DECLINE',
                                                        },
                                                    },
                                                },
                                                then: {
                                                    properties: {
                                                        declineReason: {
                                                            type: 'array',
                                                            title: 'Reason for decline',
                                                            items: {
                                                                type: 'string',
                                                                $ref: '#/definitions/declineReason',
                                                            },
                                                            uniqueItems: true,
                                                        },
                                                    },
                                                    required: ['declineReason'],
                                                },
                                            },
                                        ],
                                    },
                                    // attachment: {
                                    //     type: 'array',
                                    //     items: {
                                    //         title: 'upload',
                                    //         type: 'string',
                                    //         format: 'data-url',
                                    //     },
                                    // },
                                    // testing: {
                                    //     type: 'string',
                                    //     title: 'Find existing documents...',
                                    // },
                                    documents: {
                                        type: 'object',
                                        title: 'Link or upload document',
                                        properties: {
                                            upload1: {
                                                type: 'string',
                                            },
                                            or: {
                                                type: 'string',
                                                title: 'or',
                                            },
                                            attachment: {
                                                type: 'array',
                                                title: 'upload',
                                                items: {
                                                    title: 'upload',
                                                    type: 'string',
                                                    format: 'data-url',
                                                },
                                            },
                                        },
                                    },
                                    attachments: {
                                        type: 'array',
                                        items: {
                                            documentName: {
                                                title: 'Name',
                                                type: 'string',
                                            },
                                            documentId: {
                                                title: 'Document Id',
                                                type: 'string',
                                            },
                                        },
                                    },
                                },
                            },
                            uiSchema: {
                                $schema: 'http: //json-schema.org/draft-07/schema#',
                                'ui:globalOptions': {
                                    duplicateKeySuffixSeparator: '_',
                                    orderable: false,
                                    copyable: false,
                                },
                                'ui:submitButtonOptions': {
                                    norender: true,
                                },
                                'ui:options': {
                                    semantic: {
                                        errorOptions: {
                                            size: 'small',
                                            pointing: 'above',
                                        },
                                    },
                                },
                                suitabilityRules: {
                                    'ui:options': {
                                        label: false,
                                        ArrayFieldTemplate: 'ArrayFieldTableTemplate',
                                    },
                                    items: {
                                        'ui:options': {
                                            canAdd: false,
                                        },
                                        issue: {
                                            'ui:placeholder': 'Issue',
                                            'ui:helpText': 'Issue',
                                            'ui:options': {
                                                label: false,
                                            },
                                        },
                                        rule: {
                                            'ui:options': {
                                                label: false,
                                            },
                                        },
                                        applicationValue: {
                                            'ui:options': {
                                                label: false,
                                            },
                                        },
                                        nmid: {
                                            'ui:options': {
                                                label: false,
                                                widget: 'hidden',
                                            },
                                        },
                                        externalId: {
                                            'ui:options': {
                                                label: false,
                                                widget: 'hidden',
                                            },
                                        },
                                    },
                                },
                                suitabilityReviewStatus: {
                                    'ui:options': {
                                        label: false,
                                    },
                                    suitabilityStatus: {
                                        'ui:options': {
                                            widget: 'radio',
                                            help: 'Select suitability review decision',
                                            enumNames: ['Accept', 'Decline'],
                                        },
                                    },
                                    declineReason: {
                                        'ui:options': {
                                            label: false,
                                            help: 'Provide decline reason',
                                            class: 'mt-0',
                                            enumNames: [
                                                'Declined SPIF on internal transfer',
                                                'Loss of benefit base',
                                                'Low Income',
                                                'Low liquid asset',
                                                'High Debt',
                                                'High % of net worth in annuities/life',
                                                'Low net worth',
                                                'Replacement less than 1 year',
                                                'Requirements not received',
                                                'Surrender Charges',
                                                'Trust structure not accepted',
                                                'Inherited distributions not compliant',
                                                'Inherited liquidated while in surrender',
                                                'Recently written replacement by same agent',
                                                'Lack of response from agent',
                                                'Non-resident sale not acceptable',
                                                'Tax qualification not acceptable',
                                                'Negative disposable income',
                                                'Negative net worth',
                                                'Goal is income',
                                                'Replacement history',
                                                'Unemployed',
                                                'New York resident',
                                                'Assisted living or nursing home',
                                                'Over max issue age',
                                                'Outstanding loan',
                                                'Recently issued replacement',
                                                "Goals conflicting or don't match explanation",
                                                'Reverse mortgage',
                                            ],
                                        },
                                    },
                                },
                                documents: {
                                    inline: true,
                                    'ui:options': {
                                        label: false,
                                    },
                                    upload1: {
                                        'ui:widget': 'AutoCompleteWidget',
                                        'ui:placeholder': 'Find existing documents...',
                                        'ui:options': {
                                            label: false,
                                            icon: 'Search',
                                        },
                                    },
                                    or: {
                                        'ui:options': {
                                            label: false,
                                            inline: true,
                                        },
                                    },
                                    attachment: {
                                        'ui:options': {
                                            label: false,
                                        },
                                        'ui:props': {
                                            apiUrl: 'case/v1/form/metadata?process=Common&taskType=UI_UPLOAD_DOCUMENT&carrier=null',
                                            apiMethod: 'get',
                                        },
                                    },
                                },
                                attachments: {
                                    'ui:options': {
                                        label: false,
                                        addable: false,
                                        removable: true,
                                        ArrayFieldTemplate: 'FileInfoTemplate',
                                    },
                                },
                            },
                        },
                    ],
                },
            };

            const currentTaskMetadata = taskMetadata?.schemaContent?.tabSchemas || ([] as FormMetadata[]);

            // if (taskMetadata?.formSchema?.properties) {
            //     Object.keys(taskMetadata.formSchema.properties).forEach(async key => {
            //         const url = (taskMetadata.uiSchema as any)?.[key]?.['ui:props']?.apiUrl;
            //         console.log('🚀 ~ Object.keys ~ url:', url);
            //         const config = {
            //             authorization: `Bearer ${accessToken}`,
            //             headers: {
            //                 'Content-type': 'application/json',
            //                 'Access-Control-Allow-Origin': '*',
            //             },
            //         };

            //         if (url) {
            //             const { data } = await serverApi.get<any, AxiosResponse<any>>(apiServerBaseUrl + '/' + url, config);
            //             console.log('🚀 ~ Object.keys ~ data:', data);

            //             if (currentTaskMetadata[0] && currentTaskMetadata[0].formSchema && currentTaskMetadata[0].formSchema) {
            //                 currentTaskMetadata[0].formSchema.definitions.docCategoryEnum = {
            //                     enum: data.map((item: any) => item.value) || [],
            //                 };
            //             }

            //             console.log(
            //                 '🚀 ~ Object.keys ~ currentTaskMetadata[0].formSchema.definitions.docCategoryEnum :',
            //                 currentTaskMetadata[0].formSchema
            //             );
            //         }
            //     });
            // }

            const nigoFilters = {
                categoryIds: ['Form', 'Signature', 'Account Information'],
                carrier: carrier?.toUpperCase(),
                process: taskType,
            };

            const [caseDetails, nigoExceptionResponse] = await Promise.all([
                await getCaseDetailsSSR(caseId, accessToken as string),
                await getNigoExceptions(nigoFilters, accessToken),
            ]);

            const correlationId = caseDetails?.correlationId;

            const { nigoExceptions, nigoSubExceptions } = nigoExceptionResponse;
            const taskInfoLink = buildCaseLink(caseId);

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
