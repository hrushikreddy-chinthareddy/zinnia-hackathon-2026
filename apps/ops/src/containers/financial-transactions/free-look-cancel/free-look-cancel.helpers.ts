import { v4 as uuidV4 } from 'uuid';

import { Withdrawal } from '@deps/contexts/transactions/WithdrawalContext.types';
import { getUtcDate } from '@deps/helpers/date.helpers';
import { getDisbursementPaymentForm } from '@deps/helpers/transactions/payment.helpers';
import {
    DisbursementType,
    FreeLookCancellationRequest,
    PaymentForm,
} from '@zinnia/api-types/types/bpm';

export const buildFreeLookCancelRequestBody = (
    withdrawal: Withdrawal,
    wireCheckPaymentsEnabled: boolean
): FreeLookCancellationRequest => {
    const requestCorrelationId = withdrawal.correlationId || uuidV4();
    const FULL_ALLOCATION_PERCENTAGE = 100.0;

    const baseRequest: Partial<FreeLookCancellationRequest> = {
        correlationId: requestCorrelationId,
        effectiveDate: getUtcDate(withdrawal.effectiveDate),
        reverseInitiator: false,
        transactionAmounts: {
            disbursementType:
                withdrawal.disbursementType || DisbursementType.GROSS,
            disbursementPaymentForm:
                getDisbursementPaymentForm(withdrawal.paymentForm) ||
                PaymentForm.CHECK,
        },
    };

    if (wireCheckPaymentsEnabled) {
        return {
            ...baseRequest,
            parties: [
                {
                    partyId: withdrawal.payeePartyId,
                    paymentForm: withdrawal.paymentForm || PaymentForm.CHECK,
                    allocationPercentage: FULL_ALLOCATION_PERCENTAGE,
                    bankId: withdrawal.paymentBankId,
                    ...(withdrawal.paymentAddressId && {
                        addressId: withdrawal.paymentAddressId,
                    }),
                    ...(withdrawal.fboFfc && {
                        forBenefitOfOrForFurtherCredit: withdrawal.fboFfc,
                    }),
                },
            ],
        } as FreeLookCancellationRequest;
    }

    // For non-wire payments
    return {
        ...baseRequest,
        payeeOrBeneficiary: {
            partyId: withdrawal.payeePartyId,
            paymentForm: withdrawal.paymentForm || PaymentForm.CHECK,
            allocationPercentage: FULL_ALLOCATION_PERCENTAGE,
            ...(withdrawal.paymentBankId && {
                bankId: withdrawal.paymentBankId,
            }),
        },
    } as FreeLookCancellationRequest;
};
