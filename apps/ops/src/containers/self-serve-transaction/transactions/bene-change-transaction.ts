import { buildValidationRequestBody } from '@deps/components/dynamic-form/customization/templates/transaction-summary-template/transaction-summary-template.utils';
import {
    formatBeneficiaries,
    formatParties,
} from '@deps/containers/task-container/task-handlers/tasks/initiate-benechange-transaction';
import { PolicyResponse } from '@deps/containers/task-container/task-handlers/types';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { TransactionSubmitResponse } from '@deps/queries/api/bpm';
import { addBeneChangeTransaction } from '@deps/queries/api/web-non-financial';
import {
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

export const beneChangeSubmitHandler =
    (policy: Policy, sessionId: string, userId: string) =>
    async (payload: any) => {
        const requestBody = buildValidationRequestBody(payload);
        try {
            const response: TransactionSubmitResponse =
                await addBeneChangeTransaction(requestBody, true);
            if (response?.status !== 'ACCEPTED') {
                return {
                    response: null,
                    isSuccess: false,
                };
            }
            const caseId = response?.caseId;
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.UPDATE_BENEFICIARIES,
                    query: requestBody,
                    caseId: response?.caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
            return {
                response: response ?? null,
                isSuccess: true,
                caseId,
            };
        } catch (error) {
            browserLogError('Error submitting bene change::', { error });
            return {
                response: null,
                isSuccess: false,
            };
        }
    };

export const buildInitialBeneChangeFormData = (policy: Policy) => {
    return {
        contractInfo: {
            parties: formatParties(policy as PolicyResponse),
        },
        actionData: formatBeneficiaries(policy as PolicyResponse),
    };
};
