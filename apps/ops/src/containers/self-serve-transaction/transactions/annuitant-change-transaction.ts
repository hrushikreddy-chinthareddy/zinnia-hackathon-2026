import { buildValidationRequestBody } from '@deps/components/dynamic-form/customization/templates/transaction-summary-template/transaction-summary-template.utils';
import { PolicyRole } from '@deps/constants/policy';
import {
    formatAnnuitants,
    formatParties,
} from '@deps/containers/task-container/task-handlers/tasks/initiate-annuitantchange-transaction';
import { PolicyResponse } from '@deps/containers/task-container/task-handlers/types';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { Statuses } from '@deps/models/case/case';
import { submitRoleChange } from '@deps/queries/api/role-change';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

export const buildInitialAnnuitantChangeFormData = (policy: Policy) => {
    return {
        contractInfo: {
            parties: formatParties(policy as PolicyResponse),
        },
        actionData: formatAnnuitants(policy as PolicyResponse),
        partyUpdates: formatAnnuitants(policy as PolicyResponse),
        signatureData: {
            signatures: [
                {
                    isSignedPresent: false,
                    signDate: null,
                    signDesignation: null,
                    signType: 'OWNER',
                    signTypeForUI: 'Owner',
                },
                {
                    isSignedPresent: false,
                    signDate: null,
                    signDesignation: null,
                    signType: 'JOINT_OWNER',
                    signTypeForUI: 'Joint Owner',
                },
                {
                    isSignedPresent: false,
                    signDate: null,
                    signDesignation: null,
                    signType: 'IRREVOCABLE',
                    signTypeForUI: 'Irrevocable Beneficiary',
                },
            ],
        },
    };
};

export const annuitantChangeSubmitHandler =
    (policy: Policy, sessionId: string, userId: string) =>
    async (payload: any) => {
        const requestBody = buildValidationRequestBody(payload);
        try {
            const response = await submitRoleChange(
                requestBody?.planCode,
                requestBody?.policyNumber,
                requestBody?.role ?? PolicyRole.ANNUITANT,
                requestBody?.partyId,
                requestBody
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
                        TransactionSubmittedEventType.ADD_ANNUITANT,
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
            browserLogError('Error submitting annuitant change::', { error });
            return {
                response: null,
                isSuccess: false,
            };
        }
    };
