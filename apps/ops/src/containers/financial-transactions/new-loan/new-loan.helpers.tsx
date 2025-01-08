
import { AdhocTransactionAmount, AllocationOption, AmountType, DisbursementPaymentForm, FilingStatus, LoanType, NewLoanRequest, PartyRole, PaymentForm, TaxRateToUse } from "@zinnia/api-types/types/sor";
import dayjs from "dayjs";
import { v4 as uuidV4 } from 'uuid';

import { NewLoan } from "@deps/contexts/transactions/NewLoanContext";
import { ZAHARA_API_DATE_FORMAT } from "@deps/types/constants";

interface NewLoanRequestWithCaseId extends NewLoanRequest {
    caseId: string;
}
export const buildNewLoanRequestBody = (newLoan: NewLoan): NewLoanRequestWithCaseId => {
    return {
        caseId: newLoan.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs(newLoan.effectiveDate, 'MMDDYYYY').format(ZAHARA_API_DATE_FORMAT),
        payeeOrBeneficiary: [{
            allocationPercentage: 100,
            bankId: newLoan.paymentBankId,
            partyId: newLoan.payeePartyId,
            paymentForm: PaymentForm.ACH,
        }],
        fundAllocation: {
            allocationOption: AllocationOption.PRORATA
        },
        reverseInitiator: false,
        taxWithholdingInstructions: [
            {
                ...newLoan.taxWithholdingInstructions[0],
                filingStatus: newLoan.payeeFilingStatus as FilingStatus,
                partyId: newLoan.payeePartyId,
                // Eligible payees are owners
                partyRole: PartyRole.OWNER,
                taxJurisdiction: newLoan.payeeTaxJurisdiction,
                taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED
            },
            {
                ...newLoan.taxWithholdingInstructions[1],
                filingStatus: newLoan.payeeFilingStatus as FilingStatus,
                partyId: newLoan.payeePartyId,
                partyRole: PartyRole.OWNER,
                taxJurisdiction: newLoan.payeeTaxJurisdiction,
                taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED
            },
        ],
        transactionAmounts: {
            amountType: AmountType.AMOUNT,
            disbursementPaymentForm: DisbursementPaymentForm.ACH,
            disbursementType: newLoan.disbursementType,
            loanInterestType: AdhocTransactionAmount.loanInterestType.FIXED,
            loanType: LoanType.NONPREFERREDSTANDARDLOAN,
            requestedAmount: Number(newLoan.amount),
        },
    };
}
