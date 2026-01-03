import { buildValidationRequestBody } from '@deps/components/dynamic-form/customization/templates/transaction-summary-template/transaction-summary-template.utils';
import { Action } from '@deps/constants/policy';
import {
    formatPartyData,
    getContractInfo,
} from '@deps/containers/task-container/task-handlers/tasks/initiate-assigneechange-transaction';
import { PolicyResponse } from '@deps/containers/task-container/task-handlers/types';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { Statuses } from '@deps/models/case/case';
import {
    deleteAssignee,
    submitRoleChange,
} from '@deps/queries/api/role-change';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

export const assigneeChangeSubmitHandler =
    (policy: Policy, sessionId: string, userId: string) =>
    async (payload: any) => {
        const requestBody = buildValidationRequestBody(payload);
        try {
            const response =
                requestBody?.query?.requestType === Action.DELETE
                    ? await deleteAssignee(
                          requestBody?.planCode,
                          requestBody?.policyNumber,
                          requestBody?.partyId,
                          requestBody?.query
                      )
                    : await submitRoleChange(
                          requestBody?.planCode,
                          requestBody?.policyNumber,
                          requestBody?.role,
                          requestBody?.partyId,
                          requestBody?.query
                      );
            if (response?.status !== StatusCode.Accepted) {
                return {
                    response: null,
                    isSuccess: false,
                };
            }
            const caseId = response.data.caseId;
            const submitNigo = response.data.caseStatus === Statuses.Exception;
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.ADD_ASSIGNEE,
                    query: requestBody?.query,
                    caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
            return {
                response: response.data ?? null,
                isSuccess: true,
                caseId,
                submitNigo,
            };
        } catch (error) {
            browserLogError('Error submitting assignee change::', { error });
            return {
                response: null,
                isSuccess: false,
            };
        }
    };

export const buildInitialAssigneeChangeFormData = (policy: Policy) => {
    return {
        actionData: formatPartyData(policy as PolicyResponse),
        defaultPartyIdRoleChange:
            formatPartyData(policy as PolicyResponse)?.[0]?.party?.partyId ||
            '',
        contractInfo: {
            parties: getContractInfo(policy as PolicyResponse),
        },
    };
};
