import {
    AdhocTransactionAmount,
    AllocationOption,
    AmountType,
    DisbursementPaymentForm,
    LoanType,
    PartyRole,
    PaymentForm,
    TaxRateToUse,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { NewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { getDisbursementPaymentForm } from '@deps/helpers/transactions/payment.helpers';
import { NewLoanRequestQuery } from '@deps/queries/api/bpm';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const buildNewLoanRequestBody = (
    newLoan: NewLoan,
    wireCheckPaymentsEnabled: boolean
): NewLoanRequestQuery => {
    if (wireCheckPaymentsEnabled) {
        return {
            caseId: newLoan.caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs(newLoan.effectiveDate, 'MMDDYYYY').format(
                ZAHARA_API_DATE_FORMAT
            ),
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
                },
                {
                    ...newLoan.taxWithholdingInstructions[1],
                    filingStatus: newLoan.payeeFilingStatus,
                    partyId: newLoan.payeePartyId,
                    partyRole: PartyRole.OWNER,
                    taxJurisdiction: newLoan.payeeTaxJurisdiction,
                    taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
                },
            ],
            transactionAmounts: {
                amountType: AmountType.AMOUNT,
                disbursementPaymentForm: getDisbursementPaymentForm(
                    newLoan.paymentForm
                ) as DisbursementPaymentForm,
                disbursementType: newLoan.disbursementType,
                loanInterestType: AdhocTransactionAmount.loanInterestType.FIXED,
                loanType: LoanType.NONPREFERREDSTANDARDLOAN,
                requestedAmount: Number(newLoan.amount),
            },
        };
    }

    return {
        caseId: newLoan.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs(newLoan.effectiveDate, 'MMDDYYYY').format(
            ZAHARA_API_DATE_FORMAT
        ),
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
        taxWithholdingInstructions: [
            {
                ...newLoan.taxWithholdingInstructions[0],
                filingStatus: newLoan.payeeFilingStatus,
                partyId: newLoan.payeePartyId,
                // Eligible payees are owners
                partyRole: PartyRole.OWNER,
                taxJurisdiction: newLoan.payeeTaxJurisdiction,
                taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
            },
            {
                ...newLoan.taxWithholdingInstructions[1],
                filingStatus: newLoan.payeeFilingStatus,
                partyId: newLoan.payeePartyId,
                partyRole: PartyRole.OWNER,
                taxJurisdiction: newLoan.payeeTaxJurisdiction,
                taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
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
};
