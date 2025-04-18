import { FreeLookCancellationRequest, PaymentForm } from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { Withdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { getDisbursementPaymentForm } from '@deps/helpers/transactions/payment.helper';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const buildFreeLookCancelRequestBody = (withdrawal: Withdrawal, wireCheckPaymentsEnabled: boolean): FreeLookCancellationRequest => {
    if (wireCheckPaymentsEnabled) {
        return {
            caseId: withdrawal.caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs(withdrawal.effectiveDate, 'MMDDYYYY').format(ZAHARA_API_DATE_FORMAT),
            payeeOrBeneficiary: {
                allocationPercentage: 100,
                bankId: withdrawal.paymentBankId,
                partyId: withdrawal.payeePartyId,
                paymentForm: withdrawal.paymentForm,
            },
            parties: [{
                allocationPercentage: 100,
                bankId: withdrawal.paymentBankId,
                partyId: withdrawal.payeePartyId,
                paymentForm: withdrawal.paymentForm || 'ACH' as PaymentForm,
                addressId: withdrawal.paymentAddressId,
                forBenefitOfOrForFurtherCredit: withdrawal.fboFfc,
            }],
            reverseInitiator: false,
            transactionAmounts: {
                disbursementType: withdrawal.disbursementType,
                disbursementPaymentForm: getDisbursementPaymentForm(withdrawal.paymentForm),
            },
        };
    }

    return {
        caseId: withdrawal.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs(withdrawal.effectiveDate, 'MMDDYYYY').format(ZAHARA_API_DATE_FORMAT),
        payeeOrBeneficiary: {
            allocationPercentage: 100,
            bankId: withdrawal.paymentBankId,
            partyId: withdrawal.payeePartyId,
            paymentForm: PaymentForm.ACH,
        },
        reverseInitiator: false,
        transactionAmounts: {
            disbursementType: withdrawal.disbursementType,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            disbursementPaymentForm: PaymentForm.ACH,
        },
    };
};
