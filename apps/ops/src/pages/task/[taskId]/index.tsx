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
                //  await getCaseTaskById(taskId, accessToken),
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
                    suitabilityRules: [
                        {
                            title: 'Financial Objective',
                            subTitle: 'FinancialObjective = Other',
                            applicationValue: 'OTHERS',
                            nmid: 'SU.EM.033',
                            externalId: '1f533df0-78fd-4d2f-8cc6-d6a6da6b6024',
                        },
                        {
                            title: 'Employment and Source of Income',
                            subTitle: 'Employment Status = Yes and Source of Income = [HOUSEHOLD_WAGE or ALIMONY]',
                            applicationValue: 'Employment Status is YES and Source of Income is [HOUSEHOLD_WAGE or ALIMONY]',
                            nmid: 'SU.EM.031',
                            externalId: '3e3c7b9f-4677-4ca2-bddc-2c26bca7f8f8',
                        },
                    ],

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

            console.log('🚀 ~ getServerSideProps: ~ task:', task);
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

            //     const taskMetadata = await getTaskFormMetadata(carrier, taskType as TaskType, process as ProcessType, accessToken);

            const taskMetadata = {
                formId: '004c97a1-d97c-4faa-9b7f-8ff9105b4c29',
                process: 'New Business',
                carrier: 'WELB',
                taskType: 'SUITABILITY_REVIEW',
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
                        attachment: {
                            type: 'array',
                            title: 'Attachments',
                            items: {
                                type: 'object',
                                properties: {
                                    attachmentFile: {
                                        type: 'string',
                                        title: 'Add attachment',
                                        format: 'data-url',
                                    },
                                    documentId: {
                                        type: 'string',
                                        title: 'Document Id',
                                    },
                                    documentType: {
                                        type: 'string',
                                        title: 'Document type',
                                    },
                                    uploadedOn: {
                                        type: 'string',
                                        title: 'Uploaded On',
                                    },
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
                    'ui:options': {
                        semantic: {
                            errorOptions: {
                                size: 'small',
                                pointing: 'above',
                            },
                        },
                    },
                    attachment: {
                        'ui:options': {
                            label: true,
                        },
                        items: {
                            'ui:options': {
                                label: false,
                                title: 'attachment',
                                minItems: 0,
                            },
                            documentId: {
                                'ui:options': {
                                    label: false,
                                    widget: 'hidden',
                                },
                            },
                            documentType: {
                                'ui:options': {
                                    label: false,
                                    widget: 'hidden',
                                },
                            },
                            uploadedOn: {
                                'ui:options': {
                                    label: false,
                                    widget: 'hidden',
                                },
                            },
                            attachmentFile: {
                                'ui:options': {
                                    label: false,
                                },
                                items: {
                                    'ui:options': {
                                        label: false,
                                        widget: 'file',
                                    },
                                },
                            },
                        },
                    },
                    'ui:submitButtonOptions': {
                        norender: true,
                    },
                    suitabilityRules: {
                        'ui:options': {
                            label: false,
                            ArrayFieldTemplate: 'PartyCardTemplate',
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
