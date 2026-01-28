import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { v4 as uuidV4 } from 'uuid';

import { NewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { getUtcDate } from '@deps/helpers/date.helpers';
import { getDisbursementPaymentForm } from '@deps/helpers/transactions/payment.helpers';
import { NewLoanRequestQuery } from '@deps/queries/api/bpm';
import {
    AdhocTaxWithholdingInstructions,
    AllocationOption,
    AmountType,
    DisbursementPaymentForm,
    LoanInterestType,
    LoanType,
    PartyRole,
    PaymentForm,
    TaxRateToUse,
} from '@zinnia/api-types/types/sor';

dayjs.extend(utc);

export const buildNewLoanRequestBody = (
    newLoan: NewLoan,
    wireCheckPaymentsEnabled: boolean
): NewLoanRequestQuery => {
    if (wireCheckPaymentsEnabled) {
        return {
            caseId: newLoan.caseId || '',
            correlationId: newLoan.correlationId || uuidV4(),
            effectiveDate: getUtcDate(newLoan.effectiveDate),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            parties: [
                {
                    allocationPercentage: 100,
                    bankId: newLoan.paymentBankId,
                    partyId: newLoan.payeePartyId,
                    paymentForm: newLoan.paymentForm || PaymentForm.ACH,
                    addressId: newLoan.paymentAddressId,
                    forBenefitOfOrForFurtherCredit: newLoan.fboFfc,
                },
            ],
            fundAllocation: {
                allocationOption: AllocationOption.PRORATA,
            },
            reverseInitiator: false,
            // FIXME: contribution type from context may not match API type
            taxWithholdingInstructions: [
                {
                    ...newLoan.taxWithholdingInstructions[0],
                    filingStatus: newLoan.payeeFilingStatus,
                    partyId: newLoan.payeePartyId,
                    // TODO MG: confirm this is still the case
                    // Eligible payees are owners
                    partyRole: PartyRole.OWNER,
                    taxJurisdiction: newLoan.payeeTaxJurisdiction,
                    taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
                } as AdhocTaxWithholdingInstructions, // FIXME: mismatcch between AdhocTaxWithholdingInstructions and TaxWithholdingInstructions
                {
                    ...newLoan.taxWithholdingInstructions[1],
                    filingStatus: newLoan.payeeFilingStatus,
                    partyId: newLoan.payeePartyId,
                    partyRole: PartyRole.OWNER,
                    taxJurisdiction: newLoan.payeeTaxJurisdiction,
                    taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
                } as AdhocTaxWithholdingInstructions, // FIXME: mismatcch between AdhocTaxWithholdingInstructions and TaxWithholdingInstructions
            ],
            transactionAmounts: {
                amountType: AmountType.AMOUNT,
                disbursementPaymentForm: getDisbursementPaymentForm(
                    newLoan.paymentForm
                ),
                disbursementType: newLoan.disbursementType,
                loanInterestType: LoanInterestType.FIXED,
                loanType: LoanType.NONPREFERREDSTANDARDLOAN,
                requestedAmount: Number(newLoan.amount),
            },
        };
    }

    return {
        caseId: newLoan.caseId || '',
        correlationId: newLoan.correlationId || uuidV4(),
        effectiveDate: getUtcDate(newLoan.effectiveDate),
        payeeOrBeneficiary: [
            {
                allocationPercentage: 100,
                bankId: newLoan.paymentBankId,
                partyId: newLoan.payeePartyId,
                paymentForm: PaymentForm.ACH,
            },
        ],
        fundAllocation: {
            allocationOption: AllocationOption.PRORATA,
        },
        reverseInitiator: false,
        // FIXME: contribution type from context may not match API type
        taxWithholdingInstructions: [
            {
                ...newLoan.taxWithholdingInstructions[0],
                filingStatus: newLoan.payeeFilingStatus,
                partyId: newLoan.payeePartyId,
                // Eligible payees are owners
                partyRole: PartyRole.OWNER,
                taxJurisdiction: newLoan.payeeTaxJurisdiction,
                taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
            } as AdhocTaxWithholdingInstructions, // FIXME: mismatcch between AdhocTaxWithholdingInstructions and TaxWithholdingInstructions
            {
                ...newLoan.taxWithholdingInstructions[1],
                filingStatus: newLoan.payeeFilingStatus,
                partyId: newLoan.payeePartyId,
                partyRole: PartyRole.OWNER,
                taxJurisdiction: newLoan.payeeTaxJurisdiction,
                taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
            } as AdhocTaxWithholdingInstructions, // FIXME: mismatcch between AdhocTaxWithholdingInstructions and TaxWithholdingInstructions
        ],
        transactionAmounts: {
            amountType: AmountType.AMOUNT,
            disbursementPaymentForm: DisbursementPaymentForm.ACH,
            disbursementType: newLoan.disbursementType,
            loanInterestType: LoanInterestType.FIXED,
            loanType: LoanType.NONPREFERREDSTANDARDLOAN,
            requestedAmount: Number(newLoan.amount),
        },
    };
};
