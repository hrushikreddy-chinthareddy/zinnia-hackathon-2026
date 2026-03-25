import { buildValidationRequestBody } from '@deps/components/dynamic-form/customization/templates/transaction-summary-template/transaction-summary-template.utils';
import {
    formatPartyData,
    getContractInfo,
} from '@deps/containers/task-container/task-handlers/tasks/payeechange-data-entry';
import { PolicyResponse } from '@deps/containers/task-container/task-handlers/types';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { Statuses } from '@deps/models/case/case';
import { TransactionSubmitResponse } from '@deps/queries/api/bpm';
import { addPayeeChangeTransaction } from '@deps/queries/api/web-non-financial';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

export const payeeChangeSubmitHandler =
    (policy: Policy, sessionId: string, userId: string) =>
    async (payload: any) => {
        const requestBody = buildValidationRequestBody(payload);
        try {
            const response: TransactionSubmitResponse =
                await addPayeeChangeTransaction(requestBody);

            if (
                response?.status !== StatusCode.Accepted &&
                response?.status !== 'ACCEPTED'
            ) {
                return {
                    response: null,
                    isSuccess: false,
                };
            }
            const caseId = response?.caseId;
            const submitNigo = response?.caseStatus === Statuses.Exception;
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.ADD_PAYEE,
                    query: requestBody,
                    caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
            return {
                response: response ?? null,
                isSuccess: true,
                caseId,
                submitNigo,
            };
        } catch (error) {
            browserLogError('Error submitting payee change::', { error });
            return {
                response: null,
                isSuccess: false,
            };
        }
    };

export const buildInitialPayeeChangeFormData = (policy: Policy) => {
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
