import { TFunction } from 'next-i18next';

import { Charge as TransactionCharge } from '@deps/models/policy-sor-touchups/Transaction';
import {
    BankAccount,
    PartialWithdrawalOneTimeQuoteResponse,
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
    Transaction,
} from '@zinnia/api-types/types/sor';

import { BaseTransactionSideSheetValues, PayeePaymentDetails } from '../types';

import type { FullSurrenderOrSystematicProgramQuoteResponse } from '@zinnia/api-types/types/sor';

export type Charge = {
    amount: string;
    label?: string;
    type?: string;
    isSidesheetSumTotalRow?: boolean;
};

export type TaxWithholdingsValues = {
    state?: string;
    stateTax?: string;
    federalTax?: string;
};

export type WithdrawalDetails = {
    amount?: string;
    caption?: string;
    isSidesheetSumTotalRow?: boolean;
    label?: string;
    sentenceCase?: boolean;
    tooltipBody?: string;
    tooltipTitle?: string;
    value?: string;
};

export interface WithdrawalSideSheetValues
    extends BaseTransactionSideSheetValues {
    actualWithdrawalAmount?: number;
    disbursementType?: string;
    withdrawalDetails?: WithdrawalDetails[];
    taxWithholdings?: WithdrawalDetails[];
    withdrawalCharges?: WithdrawalDetails[];
    payeePaymentDetails?: PayeePaymentDetails[];
    effectiveDate?: string;
    processDate?: string;
    transactionType?: TransactionTypeSchemaEnum;
}

export type WithdrawalChargesValues = {
    charges?: TransactionCharge[];
    federalTaxWithheld?: string;
    state?: string;
    stateTaxWithheld?: string;
    totalChargesWithoutTaxes?: number;
    totalPayment?: number;
};

export type WithdrawalQuoteResponse =
    | FullSurrenderOrSystematicProgramQuoteResponse
    | PartialWithdrawalOneTimeQuoteResponse;

export type WithdrawalDetailsValues = {
    // ---------------------
    // Represents total amount deducted from the policy value.

    // Gross - same amount as Requested withdrawal amount
    actualWithdrawalAmount?: number;
    // ---------------------

    bankAccount?: BankAccount;
    cancelCta?: string | null;
    disbursementType?: string;
    effectiveDate?: string;

    // ---------------------
    // Pro rata (initially the only option available)
    fundDisbursementType?: string;
    // ---------------------

    // ---------------------
    // Pending - no date would pass from the backend represent on side sheet as “--”

    // Completed - should pass the date the transaction went in the batch cycle
    processDate?: string;
    // ---------------------
    reversalDate?: string;

    // ---------------------
    // Amount requested for withdrawal.
    // Gross disbursement, taxes and fees will be taken out from the selected amount.
    //   So,Amount Requested would be less than Total payment amount.
    // Net Disbursement, payee’s are paid their % of the requested withdrawal amount.
    //  Taxes and fees are taken out on top of the selected amount
    //  In this case, Amount Requested would be = to the Total payment amount.
    requestedWithdrawalAmount?: number;
    // ---------------------

    status?: string;

    // ---------------------
    // This is the total charged from the withdrawal.
    totalChargeAmount?: number;
    // ---------------------
    transactionType?: TransactionTypeSchemaEnum;
};

export type WithdrawalSideSheetProps = {
    policy: Policy;
    t: TFunction;
    transaction: Transaction;
};
