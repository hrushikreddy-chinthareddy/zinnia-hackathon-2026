import { TFunction } from 'next-i18next';

import { AccountType, Policy, Transaction, TransactionStatus, TransactionType } from '@deps/models/policy/sor-policy';

import { WithdrawalSideSheetValues } from './withdrawal/types';

export interface BaseCardModel {
    loading: boolean;
    t: TFunction;
}

export interface BaseFinancialTransactionSideSheetModel {
    content?: string;
    transactionType?: string;
    title?: string;
}

export const FinancialTransactionTypes: TransactionType[] = [
    TransactionType.PaymentInitialPremium,
    TransactionType.InitialPremium,
    TransactionType.OneTimePremium,
    TransactionType.PaymentOneTimePremium,
    TransactionType.SubsequentPayment,
    TransactionType.SubsequentPremium,
    TransactionType.FullSurrender,
    TransactionType.PartialWithdrawalOneTime,
    TransactionType.FreeLookCancellation,
];

export type TransactionSideSheetBaseModel = TransactionSideSheetValues | WithdrawalSideSheetValues;

export interface BaseTransactionSideSheetValues {
    cancelCta?: string;
    reverseCta?: string;
    getAsyncSideSheetValues?: () => Promise<Partial<TransactionSideSheetValues | WithdrawalSideSheetValues>>;
    refreshTransactions?: () => void;
    reversalTransactionId?: string | null;
    transactionId?: string;
    transactionType?: string;
    transactionValue?: number;
}

export interface TransactionSideSheetValues extends BaseTransactionSideSheetValues {
    appliedAmount?: number | string;
    submittedAmount?: number;
    totalPayment?: number;

    paymentMethod?: string;

    effectiveDate?: string;
    processDate?: string;

    status?: string;
}

export interface NonFianancialTransactionSideSheetValues extends BaseTransactionSideSheetValues {
    effectiveDate?: string;
    name?: string;
    roleTags?: string[];
}

export type SideSheetTransactionProps = {
    policy: Policy;
    refreshTransactions?: () => void;
    transaction: Transaction;
};

export type ReverseTransactionSidesheetOriginalTransactionValues = {
    submittedAmount?: number;
    appliedAmount?: number | TransactionStatus;
    processDate?: string;
};

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

export interface PayeePaymentDetails {
    allocationPercentage?: number;
    bankDetails: {
        accountNumber: string;
        accountType?: AccountType;
        branchName: string;
        nameOnAccount: string;
    };
    disbursementAmount?: number;
    partyId: string;
    state?: string;
}
