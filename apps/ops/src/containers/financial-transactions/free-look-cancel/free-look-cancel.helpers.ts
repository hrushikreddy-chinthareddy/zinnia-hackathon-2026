import {
    FreeLookCancellationRequest,
    PaymentForm,
} from '@zinnia/api-types/types/bpm';
import { v4 as uuidV4 } from 'uuid';

import { Withdrawal } from '@deps/contexts/transactions/WithdrawalContext.types';
import { getUtcDate } from '@deps/helpers/date.helpers';
import { getDisbursementPaymentForm } from '@deps/helpers/transactions/payment.helpers';

export const buildFreeLookCancelRequestBody = (
    withdrawal: Withdrawal,
    wireCheckPaymentsEnabled: boolean
): FreeLookCancellationRequest => {
    const requestCorrelationId = withdrawal.correlationId || uuidV4();

    if (wireCheckPaymentsEnabled) {
        return {
            caseId: withdrawal.caseId || '',
            correlationId: requestCorrelationId,
            effectiveDate: getUtcDate(withdrawal.effectiveDate),
            parties: [
                {
                    allocationPercentage: 100,
                    bankId: withdrawal.paymentBankId,
                    partyId: withdrawal.payeePartyId,
                    paymentForm:
                        withdrawal.paymentForm || ('ACH' as PaymentForm),
                    addressId: withdrawal.paymentAddressId,
                    forBenefitOfOrForFurtherCredit: withdrawal.fboFfc,
                },
            ],
            reverseInitiator: false,
            transactionAmounts: {
                disbursementType: withdrawal.disbursementType,
                disbursementPaymentForm: getDisbursementPaymentForm(
                    withdrawal.paymentForm
                ),
            },
        };
    }

    return {
        caseId: withdrawal.caseId || '',
        correlationId: requestCorrelationId,
        effectiveDate: getUtcDate(withdrawal.effectiveDate),
        parties: [
            {
                allocationPercentage: 100,
                bankId: withdrawal.paymentBankId,
                partyId: withdrawal.payeePartyId,
                paymentForm: PaymentForm.ACH,
            },
        ],
        reverseInitiator: false,
        transactionAmounts: {
            disbursementType: withdrawal.disbursementType,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            disbursementPaymentForm: PaymentForm.ACH,
        },
    };
};
