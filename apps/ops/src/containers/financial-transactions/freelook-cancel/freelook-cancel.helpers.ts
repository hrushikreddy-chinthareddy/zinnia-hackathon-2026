import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { Withdrawal } from '@deps/contexts/WithdrawalContext';
import { PaymentForm } from '@deps/models/policy/sor-policy';
import { FreeLookCancellationRequestQuery } from '@deps/queries/api/bpm';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const buildFreelookCancelRequestBody = (withdrawal: Withdrawal): FreeLookCancellationRequestQuery => {
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
            disbursementPaymentForm: PaymentForm.ACH,
        },
    };
};
