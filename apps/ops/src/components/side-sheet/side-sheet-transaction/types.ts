import { TFunction } from 'next-i18next';

import { AccountType, Policy, Transaction } from '@zinnia/api-types/types/sor';

import { WithdrawalSideSheetValues } from './withdrawal/types';

export interface BaseCardModel {
    loading: boolean;
    t: TFunction;
}

export type TransactionSideSheetBaseModel =
    | TransactionSideSheetValues
    | WithdrawalSideSheetValues;

export interface BaseTransactionSideSheetValues {
    cancelCta?: string;
    reverseCta?: string;
    getAsyncSideSheetValues?: () => Promise<
        Partial<TransactionSideSheetValues | WithdrawalSideSheetValues>
    >;
    refreshTransactions?: () => void;
    reversalTransactionId?: string | null;
    transactionId?: string;
    transactionType?: string;
    transactionValue?: number;
}

export interface TransactionSideSheetValues
    extends BaseTransactionSideSheetValues {
    appliedAmount?: number | string;
    submittedAmount?: number;
    totalPayment?: number;

    paymentMethod?: string;

    effectiveDate?: string;
    processDate?: string;

    status?: string;
}

export type SideSheetTransactionProps = {
    policy: Policy;
    refreshTransactions?: () => void;
    transaction: Transaction;
};

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
    paymentForm?: string;
    addressId?: string;
    bankId?: string;
}
