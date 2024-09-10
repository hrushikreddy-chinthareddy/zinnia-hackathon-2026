import dayjs from "dayjs";
import { v4 as uuidV4 } from 'uuid';

import { Withdrawal } from "@deps/contexts/WithdrawalContext";
import { AllocationOption, AmountType, PaymentForm } from "@deps/models/policy/sor-policy";
import { FullSurrenderWithdrawalRequestQuery, PartialWithdrawalOneTimeRequestQuery } from "@deps/queries/api/bpm";
import { ZAHARA_API_DATE_FORMAT } from "@deps/types/constants";

export const buildWithdrawalsRequestBody = (withdrawal: Withdrawal): FullSurrenderWithdrawalRequestQuery | PartialWithdrawalOneTimeRequestQuery => {
    return {
        caseId: withdrawal.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs(withdrawal.effectiveDate, 'MMDDYYYY').format(ZAHARA_API_DATE_FORMAT),
        payeeOrBeneficiary: [{
            allocationPercentage: 100,
            bankId: withdrawal.paymentBankId,
            partyId: withdrawal.payeePartyId,
            paymentForm: PaymentForm.ACH,
        }],
        fundAllocation: {
            allocationOption: AllocationOption.DEFAULT
        },
        reverseInitiator: false,
        // We initialize taxWithholdingInstructions with a federal and state object in WithdrawalContext
        // This adds the payee information to those objects before making the request
        taxWithholdingInstructions: [
            { ...withdrawal.taxWithholdingInstructions[0], partyId: withdrawal.payeePartyId, filingStatus: withdrawal.payeeFilingStatus, taxJurisdiction: withdrawal.payeeTaxJurisdiction },
            { ...withdrawal.taxWithholdingInstructions[1], partyId: withdrawal.payeePartyId, filingStatus: withdrawal.payeeFilingStatus, taxJurisdiction: withdrawal.payeeTaxJurisdiction },
        ],
        transactionAmounts: {
            amountType: AmountType.AMOUNT,
            disbursementType: withdrawal.disbursementType,
            disbursementPaymentForm: PaymentForm.ACH,
            requestedAmount: Number(withdrawal.amount),
        },
    };
}
