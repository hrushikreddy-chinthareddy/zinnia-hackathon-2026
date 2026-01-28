import { Transaction } from '@zinnia/api-types/types/sor';

export interface BaseFinancialTransactionSideSheetModel {
    content?: string;
    transactionType?: string;
    title?: string;
}

export const FinancialTransactionTypes: Transaction.transactionType[] = [
    Transaction.transactionType.PAYMENT_INITIAL_PREMIUM,
    Transaction.transactionType.INITIAL_PREMIUM,
    Transaction.transactionType.ONE_TIME_PREMIUM,
    Transaction.transactionType.PAYMENT_ONE_TIME_PREMIUM,
    Transaction.transactionType.SUBSEQUENT_PAYMENT,
    Transaction.transactionType.SUBSEQUENT_PREMIUM,
    Transaction.transactionType.FULL_SURRENDER,
    Transaction.transactionType.PARTIAL_WITHDRAWAL_ONE_TIME,
    Transaction.transactionType.FREE_LOOK_CANCELLATION,
    Transaction.transactionType.NEW_LOAN,
    Transaction.transactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];
