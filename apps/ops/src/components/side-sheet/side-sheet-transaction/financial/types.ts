import { TransactionType } from '@zinnia/api-types/types/sor';

export interface BaseFinancialTransactionSideSheetModel {
    content?: string;
    transactionType?: string;
    title?: string;
}

export const FinancialTransactionTypes: TransactionType[] = [
    TransactionType.PAYMENT_INITIAL_PREMIUM,
    TransactionType.INITIAL_PREMIUM,
    TransactionType.ONE_TIME_PREMIUM,
    TransactionType.PAYMENT_ONE_TIME_PREMIUM,
    TransactionType.SUBSEQUENT_PAYMENT,
    TransactionType.SUBSEQUENT_PREMIUM,
    TransactionType.FULL_SURRENDER,
    TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionType.FREE_LOOK_CANCELLATION,
    TransactionType.NEW_LOAN,
    TransactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];
