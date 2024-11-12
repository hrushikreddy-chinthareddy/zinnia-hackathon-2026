import { TFunction } from "next-i18next";

import { BankAccount, FullSurrenderQuoteResponse, PartialWithdrawalOneTimeQuoteResponse, Policy, Transaction, TransactionChargesItem, TransactionType } from "@deps/models/policy/sor-policy";

import { BaseTransactionSideSheetValues, PayeePaymentDetails } from "../types";

export type Charge = {
    amount: string;
    label?: string;
    type?: string;
    isSidesheetSumTotalRow?: boolean;
};

export type TaxWithholdingsValues = {
    federalTax?: string;
    stateTax?: string;
    state?: string;
}

export type WithdrawalDetails = {
    label?: string;
    caption?: string;
    value?: string;
    tooltipTitle?: string;
    tooltipBody?: string;
    sentenceCase?: boolean;
    // TODO MG: added last minute
    amount?: string;
    isSidesheetSumTotalRow?: boolean;
}

export interface WithdrawalSideSheetValues extends BaseTransactionSideSheetValues {
    withdrawalDetails?: WithdrawalDetails[];
    taxWithholdings?: WithdrawalDetails[];
    actualWithdrawalAmount?: number
    withdrawalCharges?: WithdrawalDetails[];
    payeePaymentDetails?: PayeePaymentDetails[];
    // TODO MG: these should be removed once reverse recreate has its own object
    effectiveDate?: string;
    processDate?: string;
    transactionType?: TransactionType;
    // disbursementAmount?: string;

    // // ---------------------
    // // This number should represent the actual number that will be paid out to the payees.

    // // Gross disbursement, taxes and fees will be taken out from the selected amount. So,  Amount Requested would be less than Total payment amount.

    // // Net Disbursement, payee’s are paid their % of the requested withdrawal amount. Taxes and fees are taken out on top of the selected amount. In this case, Amount Requested would be = to the Total payment amount.
    // totalPayment?: number;

    // // ---------------------
    // `disbursementType`
    // Gross or Net
    // disbursementType?: string;
    // ---------------------

    // requestedWithdrawalAmount?: string;
    // ---------------------


    // ---------------------

    // ---------------------
    // Pro rata (initially the only option available)
    // fundDisbursementType?: string;
    // ---------------------

    // ---------------------
    // `taxRateToUse`

    // Federal and State Withholding options are:

    // NOWITHHOLDINGELECTED = “Do not withhold”

    // USEVALUESENTERED = “{percentage}%” or “${dollar}}

    // USEDEFAULTTABLE = 

    // Federal = “Min required ({%})”

    // State = “Min required”
    // TODO MG: removed this for the new one above
    // taxWithholdings: TaxWithholdingsModel;
    // ---------------------

    // ---------------------
    // `taxJurisdiction`
    // taxState?: string;
    // ---------------------

    // ---------------------
    // `totalChargeAmount`
    // For Everly this value will alwauys be $0.00
    // TODO MG: removed for new prop above
    // withdrawalCharges?: string;
    // ---------------------

    // ---------------------
    // Applies tax withholdings to the taxable amount. 

    // When cost basis is less than the withdrawal amount, no taxes will be applied
    // federalTaxApplies?: string;
    // ---------------------

    // ---------------------
    // Applies tax withholdings to the taxable amount. 

    // When cost basis is less than the withdrawal amount, no taxes will be applied
    // stateTaxApplied?: string;
    // ---------------------

    // ---------------------
    // Who the disbursement is being sent to.

    // While not supported by the back-end now, Multiple payees could be retuned in APIs in the future. Those payees should display on individual rows on the Payee details chart.
    // payee?: PayeeParty;
    // ---------------------


    // ---------------------
    // TODO MG: may not need payee above
    // payeeName?: string;
    // ---------------------

    // ---------------------
    // % of Total Payment the payee should receive
    // `allocationPercentage`
    // percentageToPayee?: string;
    // ---------------------

    // ---------------------
	// `disbursementAmount`
    // amount being paid to that payee ( % * (Requested - charges and fees))
    // amountToPayee?: string;
    // ---------------------
}

export type WithdrawalChargesValues = {
    charges?: TransactionChargesItem[];
    totalChargesWithoutTaxes?: number;
    federalTaxWithheld?: string;
    stateTaxWithheld?: string;
    state?: string;
    totalPayment?: number;
}

export type WithdrawalQuoteResponse = FullSurrenderQuoteResponse | PartialWithdrawalOneTimeQuoteResponse

export type WithdrawalDetailsValues = {
    // actualAmount?: number;
    // appliedAmount?: number;

    // ---------------------
    // Amount requested for withdrawal. 
    // Gross disbursement, taxes and fees will be taken out from the selected amount.
    //   So,Amount Requested would be less than Total payment amount.
    // Net Disbursement, payee’s are paid their % of the requested withdrawal amount.
    //  Taxes and fees are taken out on top of the selected amount
    //  In this case, Amount Requested would be = to the Total payment amount.
    requestedWithdrawalAmount?: number;
    // ---------------------

    // ---------------------
    // Represents total amount deducted from the policy value.

    // Gross - same amount as Requested withdrawal amount
    actualWithdrawalAmount?: number;
    // ---------------------

    // ---------------------
    // Represents total amount deducted from the policy value.
    // Net - We would expect this value to be = to requested amount + taxes and fees. 
    // TODO MG: do logic for net in actualWithdrawalAmount
    // netActualWithdrawalAmount?: number;
    // ---------------------

    // ---------------------
    // This number should represent the actual number that will be paid out to the payees.

    // Gross disbursement, taxes and fees will be taken out from the selected amount.
    //  So, Amount Requested would be less than Total payment amount.

    // Net Disbursement, payee’s are paid their % of the requested withdrawal amount.
    // Taxes and fees are taken out on top of the selected amount.
    // In this case, Amount Requested would be = to the Total payment amount.
    totalPayment?: number;
    // ---------------------

    // ---------------------
    // Pro rata (initially the only option available)
    fundDisbursementType?: string;
    // ---------------------

    // ---------------------
    // `effectiveDate`
    effectiveDate?: string;
    // ---------------------

    // ---------------------
    // `processDate`

    // Pending - no date would pass from the backend represent on side sheet as “--”

    // Completed - should pass the date the transaction went in the batch cycle 
    processDate?: string;
    // ---------------------
    transactionType?: TransactionType;

    bankAccount?: BankAccount;
    cancelCta?: string | null;
    disbursementType?: string;
    status?: string;
    // totalPayment?: number;
}

export type WithdrawalSideSheetProps = {
    policy: Policy;
    t: TFunction;
    transaction: Transaction;
}
