import dayjs from 'dayjs';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { Processes } from '@deps/models/case/case';
import { TaskType } from '@deps/models/case/task';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { Policy } from '@zinnia/api-types/types/sor';

import {
    assigneeChangeSubmitHandler,
    buildInitialAssigneeChangeFormData,
} from './transactions/assignee-change-transaction';
import {
    beneChangeSubmitHandler,
    buildInitialBeneChangeFormData,
} from './transactions/bene-change-transaction';
import { SelfServeTransaction } from './types';
import beneChangeMetadata from '../../jsonschema-mock-service/tasks/DEFAULT/initiate-benechange-transaction.json';
import assigneeChangeMetadata from '../../jsonschema-mock-service/tasks/WELB/initiate-assigneechange-transaction.json';

const removeFirstTabSchema = (metadata: any) => ({
    ...metadata,
    schemaContent: {
        ...metadata.schemaContent,
        tabSchemas: metadata.schemaContent?.tabSchemas?.slice(1),
    },
});

export const getSelfServeTransactionData = (
    transactionType: SelfServeTransaction,
    policy: Policy,
    planCode: string
) => {
    switch (transactionType) {
        case SelfServeTransaction.ASSIGNEE_CHANGE: {
            const metadata = removeFirstTabSchema(assigneeChangeMetadata);
            return {
                metaData: JSON.parse(JSON.stringify(metadata)),
                initialCustomData: {
                    policyNumber: policy.policyNumber,
                    planCode,
                    effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                    taskType: TaskType.Initiate_AssigneeChange_Transaction,
                    issueResolved: true,
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
        case SelfServeTransaction.BENE_CHANGE: {
            const metadata = removeFirstTabSchema(beneChangeMetadata);
            return {
                metaData: JSON.parse(JSON.stringify(metadata)),
                initialCustomData: {
                    policyNumber: policy.policyNumber,
                    planCode,
                    effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                    taskType: TaskType.Initiate_BeneChange_Transaction,
                    carrierId: policy?.carrierId,
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
                startStepTitle: 'beneChange.start.title',
                startStepSubtitle: 'beneChange.start.subTitle',
                confirmStepSubtitle: 'beneChange.confirm.subTitle',
                submitResponseHandler: beneChangeSubmitHandler,
            };
        }
    }
};
