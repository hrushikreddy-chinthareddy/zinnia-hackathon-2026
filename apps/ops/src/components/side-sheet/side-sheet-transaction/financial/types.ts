import { TransactionTypeEnum } from '@zinnia/api-types/types/sor';

export interface BaseFinancialTransactionSideSheetModel {
    content?: string;
    transactionType?: string;
    title?: string;
}

export const FinancialTransactionTypes: TransactionTypeEnum[] = [
    TransactionTypeEnum.PAYMENT_INITIAL_PREMIUM,
    TransactionTypeEnum.INITIAL_PREMIUM,
    TransactionTypeEnum.ONE_TIME_PREMIUM,
    TransactionTypeEnum.PAYMENT_ONE_TIME_PREMIUM,
    TransactionTypeEnum.SUBSEQUENT_PAYMENT,
    TransactionTypeEnum.SUBSEQUENT_PREMIUM,
    TransactionTypeEnum.FULL_SURRENDER,
    TransactionTypeEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionTypeEnum.FREE_LOOK_CANCELLATION,
    TransactionTypeEnum.NEW_LOAN,
    TransactionTypeEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];
