import { TFunction } from 'next-i18next';

import { PayeeParty } from '@deps/components/history-event-card/types';
import {
    FullSurrenderQuoteResponse,
    PartialWithdrawalOneTimeQuoteResponse,
    Policy,
    TaxWithheldAmount,
    TaxWithholdingInstructions,
    Transaction,
    TransactionChargesItem,
    TransactionStatus,
} from '@deps/models/policy/sor-policy';

export interface BaseCardViewModel {
    loading: boolean;
    t: TFunction;
}

export interface BaseFinancialTransactionSideSheetViewModel {
    content?: string;
    transactionType?: string;
    title?: string;
}

export type Charge = {
    amount: string;
    label?: string;
    isSidesheetSumTotalRow?: boolean;
};

type InterestRateValue = {
    interestRate?: number;
};

export type NewLoanTransactionSideSheetValues = {
    effectiveDate: string;
    fundDisbursementType?: string;
    getAsyncSideSheetValues?: () => Promise<Partial<NewLoanTransactionSideSheetValues>>;
    interestRate?: number;
    loanAmount?: number;
    loanInterestType?: string;
    payees: PayeeParty[];
    processDate: string;
    processedAmount?: number | null;
    status?: string;
    submittedAmount?: number;
} & InterestRateValue;

export interface SideSheetFinancialTransactionViewModel extends BaseCardViewModel {
    values: TransactionSideSheetValues;
}

export interface SideSheetReversedTransactionViewModel extends BaseCardViewModel {
    values: ReverseTransactionSidesheetValues;
}

export type SideSheetTransactionProps = {
    refreshTransactions?: () => void;
    policy: Policy;
    transaction: Transaction;
};

export type TransactionSideSheetValues = {
    appliedAmount?: string | number;
    cancelCta?: string | null;
    reverseCta?: string | null;
    reversalTransactionId?: string | null;
    effectiveDate?: string;
    paymentMethod?: string;
    processDate?: string;
    submittedAmount?: number | string;
    transactionId?: string;
    transactionType?: string;
    transactionValue?: string | number;
    status?: string;
    totalPayment?: string | number;
    disbursementType?: string;
    bankDetails?: any;
    requestedAmount?: number | string;
    actualAmount?: number | string;
    charges?: TransactionChargesItem[];
    payees?: PayeeParty[];

    taxWithheldAmounts?: TaxWithheldAmount[];
    taxWithholdingInstructions?: TaxWithholdingInstructions[];
    netActualWithdrawalAmount?: string;
    taxWithholdingDetails?: TransactionDetails[];
    transactionDetails?: TransactionDetails[];
    quote?: FullSurrenderQuoteResponse | PartialWithdrawalOneTimeQuoteResponse;
    federalTaxWithheld?: string;
    federalTaxWithholding?: string;
    // Gross or Net
    fundDisbursementType?: string;
    payee?: PayeeParty;
    state?: string;
    stateTaxWithheld?: string;
    stateTaxWithholding?: string;
    totalChargesWithoutTaxes?: string;
    withdrawalCharge?: string;

    // non financial
    name?: string;
    roleTags?: string[];
    getAsyncSideSheetValues?: () => Promise<Partial<TransactionSideSheetValues>>;
};

export type ReverseTransactionSidesheetOriginalTransactionValues = {
    submittedAmount?: number;
    appliedAmount?: number | TransactionStatus;
    processDate?: string;
    
}

export type ReverseTransactionSidesheetValues = {
    effectiveDate?: string;
    transactionType?: string;
    newAppliedAmount?: number;
    paymentMethod?: string;
    status?: string;
    transactionId?: string;
    transactionValue?: number;
    reversalDate?: string;
    getAsyncSideSheetValues?: () => Promise<Partial<ReverseTransactionSidesheetOriginalTransactionValues>>;
} & ReverseTransactionSidesheetOriginalTransactionValues;

export interface TransactionDetails {
    caption?: string;
    label?: string;
    tooltipTitle?: string;
    tooltipBody?: string;
    value?: string;
}
