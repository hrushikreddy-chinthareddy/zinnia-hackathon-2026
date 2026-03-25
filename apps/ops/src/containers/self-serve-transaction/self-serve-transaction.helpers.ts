import dayjs from 'dayjs';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import payeeChangeSchema from '@deps/jsonschema-mock-service/tasks/DEFAULT/payeechange-data-entry.json';
import { Processes } from '@deps/models/case/case';
import { ProcessType } from '@deps/models/case/enums';
import { TaskType } from '@deps/models/case/task';
import { getTaskFormMetadata } from '@deps/queries/api/v1/task';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { browserLogInfo } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

import {
    annuitantChangeSubmitHandler,
    buildInitialAnnuitantChangeFormData,
} from './transactions/annuitant-change-transaction';
import {
    assigneeChangeSubmitHandler,
    buildInitialAssigneeChangeFormData,
} from './transactions/assignee-change-transaction';
import {
    beneChangeSubmitHandler,
    buildInitialBeneChangeFormData,
} from './transactions/bene-change-transaction';
import {
    payeeChangeSubmitHandler,
    buildInitialPayeeChangeFormData,
} from './transactions/payee-change-transaction';
import { SelfServeTransaction } from './types';

const removeFirstTabSchema = (metadata: any, taskType: TaskType) => {
    if (!metadata?.schemaContent?.tabSchemas) {
        return metadata;
    }

    const benechangeDiscardedTabIndexes = [0, 1, 5];
    const payeechangeDiscardedTabIndexes = [0, 1, 2, 5];

    const getFilteredTabs = (taskType: TaskType, tabs: any[]) => {
        switch (taskType) {
            case TaskType.Initiate_BeneChange_Transaction:
                return tabs.filter(
                    (_: any, i: number) =>
                        !benechangeDiscardedTabIndexes.includes(i)
                );
            case TaskType.payeechange_data_entry:
                return tabs.filter(
                    (_: any, i: number) =>
                        !payeechangeDiscardedTabIndexes.includes(i)
                );
            default:
                return tabs.slice(1);
        }
    };

    return {
        ...metadata,
        schemaContent: {
            ...metadata.schemaContent,
            tabSchemas: getFilteredTabs(
                taskType,
                metadata.schemaContent.tabSchemas
            ),
        },
    };
};

const getTransactionMetadata = async (
    taskType: TaskType,
    policy: Policy,
    planCode: string
) => {
    const clientId = policy?.carrierId || '';
    browserLogInfo('getSelfServeTransactionData::', {
        taskType,
        clientId,
        processType: ProcessType.PolicyUpdate,
        planCode,
        policyNumber: policy?.policyNumber,
    });
    const metaData = await getTaskFormMetadata(
        clientId,
        taskType,
        ProcessType.PolicyUpdate
    );
    return removeFirstTabSchema(metaData, taskType);
};

export const getSelfServeTransactionData = async (
    transactionType: SelfServeTransaction,
    policy: Policy,
    planCode: string
) => {
    switch (transactionType) {
        case SelfServeTransaction.ASSIGNEE_CHANGE: {
            const metadata = await getTransactionMetadata(
                TaskType.Initiate_AssigneeChange_Transaction,
                policy,
                planCode
            );
            return {
                metaData: JSON.parse(JSON.stringify(metadata ?? {})),
                initialCustomData: {
                    policyNumber: policy.policyNumber,
                    planCode,
                    effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                    taskType: TaskType.Initiate_AssigneeChange_Transaction,
                    issueResolved: true,
                    carrier: policy.carrierId,
                },
                initialFormData: buildInitialAssigneeChangeFormData(policy),
                transactionType: SelfServeTransaction.ASSIGNEE_CHANGE,
                processType: Processes.PolicyUpdate,
                processSubType: [Processes.AssigneeChange],
                parentPage: ParentPage.CreateCase,
                leaveTransactionLink: '/',
                startStepTitle: 'assigneeChange.start.title',
                startStepSubtitle: 'assigneeChange.start.subTitle',
                confirmStepSubtitle: 'assigneeChange.confirm.subTitle',
                submitResponseHandler: assigneeChangeSubmitHandler,
            };
        }
        case SelfServeTransaction.PAYEE_CHANGE: {
            const payeeMetadata = removeFirstTabSchema(
                payeeChangeSchema,
                TaskType.payeechange_data_entry
            );
            return {
                metaData: JSON.parse(JSON.stringify(payeeMetadata ?? {})),
                initialCustomData: {
                    policyNumber: policy.policyNumber,
                    planCode,
                    effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                    taskType: TaskType.payeechange_data_entry,
                    issueResolved: true,
                    carrier: policy.carrierId,
                },
                initialFormData: buildInitialPayeeChangeFormData(policy),
                transactionType: SelfServeTransaction.PAYEE_CHANGE,
                processType: Processes.PolicyUpdate,
                processSubType: [Processes.PayeeChange],
                parentPage: ParentPage.CreateCase,
                leaveTransactionLink: '/',
                startStepTitle: 'payeeChange.start.title',
                startStepSubtitle: 'payeeChange.start.subTitle',
                confirmStepSubtitle: 'payeeChange.confirm.subTitle',
                submitResponseHandler: payeeChangeSubmitHandler,
            };
        }
        case SelfServeTransaction.BENE_CHANGE: {
            const metadata = await getTransactionMetadata(
                TaskType.Initiate_BeneChange_Transaction,
                policy,
                planCode
            );
            return {
                metaData: JSON.parse(JSON.stringify(metadata ?? {})),
                initialCustomData: {
                    policyNumber: policy.policyNumber,
                    planCode,
                    effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                    taskType: TaskType.Initiate_BeneChange_Transaction,
                    carrier: policy?.carrierId,
                    policyStatus: policy?.policyStatus,
                    issueResolved: true,
                },
                initialFormData: buildInitialBeneChangeFormData(policy),
                transactionType: SelfServeTransaction.BENE_CHANGE,
                processType: Processes.PolicyUpdate,
                processSubType: [
                    Processes.BeneficiaryChange,
                    Processes.BeneficiaryUpdate,
                ],
                parentPage: ParentPage.CreateCase,
                leaveTransactionLink: '/',
                startStepTitle: 'beneChange.title',
                startStepSubtitle: 'beneChange.subTitle',
                confirmStepSubtitle: 'beneChange.confirmSubTitle',
                submitResponseHandler: beneChangeSubmitHandler,
            };
        }
        case SelfServeTransaction.ANNUITANT_CHANGE: {
            const metadata = await getTransactionMetadata(
                TaskType.Initiate_AnnuitantChange_Transaction,
                policy,
                planCode
            );
            return {
                metaData: JSON.parse(JSON.stringify(metadata ?? {})),
                initialCustomData: {
                    policyNumber: policy.policyNumber,
                    planCode,
                    taskType: TaskType.Initiate_AnnuitantChange_Transaction,
                    issueResolved: true,
                    carrier: policy.carrierId,
                },
                initialFormData: buildInitialAnnuitantChangeFormData(policy),
                transactionType: SelfServeTransaction.ANNUITANT_CHANGE,
                processType: Processes.PolicyUpdate,
                processSubType: [Processes.AnnuitantChange],
                parentPage: ParentPage.CreateCase,
                leaveTransactionLink: '/',
                startStepTitle: 'annuitantChange.title',
                startStepSubtitle: 'annuitantChange.subTitle',
                confirmStepSubtitle: 'annuitantChange.confirmSubTitle',
                submitResponseHandler: annuitantChangeSubmitHandler,
            };
        }
    }
};
