import dayjs from 'dayjs';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { Processes } from '@deps/models/case/case';
import { ProcessType } from '@deps/models/case/enums';
import { TaskType } from '@deps/models/case/task';
import { getTaskFormMetadata } from '@deps/queries/api/v1/task';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { browserLogInfo } from '@deps/utils/browser-logging';
import { isNonProductionEnvironment } from '@deps/utils/environment.helpers';
import { Policy } from '@zinnia/api-types/types/sor';

import {
    assigneeChangeSubmitHandler,
    buildInitialAssigneeChangeFormData,
} from './transactions/assignee-change-transaction';
import { SelfServeTransaction } from './types';

const removeFirstTabSchema = (metadata: any) => ({
    ...metadata,
    schemaContent: {
        ...metadata.schemaContent,
        tabSchemas: metadata.schemaContent?.tabSchemas?.slice(1),
    },
});

export const getSelfServeTransactionData = async (
    transactionType: SelfServeTransaction,
    policy: Policy,
    planCode: string
) => {
    switch (transactionType) {
        case SelfServeTransaction.ASSIGNEE_CHANGE: {
            const taskType = TaskType.Initiate_AssigneeChange_Transaction;
            const clientId = policy?.carrierId || '';
            const isProdEnv = !isNonProductionEnvironment();

            browserLogInfo('getSelfServeTransactionData environment', {
                isProdEnv,
                taskType,
                clientId,
                processType: ProcessType.PolicyUpdate,
                planCode,
                policyNumber: policy?.policyNumber,
            });

            const assigneeChangeMetadataNew = isProdEnv
                ? await getTaskFormMetadata(
                      clientId,
                      taskType,
                      ProcessType.PolicyUpdate
                  )
                : await import(
                      `@deps/jsonschema-mock-service/tasks/DEFAULT/initiate-assigneechange-transaction.json`
                  );

            const metadata = removeFirstTabSchema(assigneeChangeMetadataNew);
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
    }
};
