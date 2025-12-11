import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { LoanPayment } from '@deps/contexts/transactions/LoanPaymentContext';
import { LoanRepaymentOneTimeRequestQuery } from '@deps/queries/api/bpm';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { AllocationOption, PaymentForm } from '@zinnia/api-types/types/sor';

export const buildLoanPaymentRequestBody = (
    loanPayment: LoanPayment
): LoanRepaymentOneTimeRequestQuery => {
    return {
        caseId: loanPayment.caseId || '',
        correlationId: loanPayment.correlationId || uuidV4(),
        effectiveDate: dayjs(loanPayment.effectiveDate, 'MMDDYYYY').format(
            ZAHARA_API_DATE_FORMAT
        ),
        payor: {
            bankId: loanPayment.paymentBankId,
            partyId: loanPayment.payorPartyId,
            paymentForm: PaymentForm.ACH,
        },
        fundAllocation: {
            allocationOption: AllocationOption.DEFAULT,
        },
        reverseInitiator: loanPayment.reverseInitiator,
        transactionAmounts: {
            requestedAmount: Number(loanPayment.paymentAmount),
        },
    };
};
