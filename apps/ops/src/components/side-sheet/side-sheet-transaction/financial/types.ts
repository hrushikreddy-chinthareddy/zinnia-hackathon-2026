import { SchemaEnum as TransactionTypeSchemaEnum } from '@zinnia/api-types/types/sor';

export interface BaseFinancialTransactionSideSheetModel {
    content?: string;
    transactionType?: string;
    title?: string;
}

export const FinancialTransactionTypes: TransactionTypeSchemaEnum[] = [
    TransactionTypeSchemaEnum.PAYMENT_INITIAL_PREMIUM,
    TransactionTypeSchemaEnum.INITIAL_PREMIUM,
    TransactionTypeSchemaEnum.ONE_TIME_PREMIUM,
    TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM,
    TransactionTypeSchemaEnum.SUBSEQUENT_PAYMENT,
    TransactionTypeSchemaEnum.SUBSEQUENT_PREMIUM,
    TransactionTypeSchemaEnum.FULL_SURRENDER,
    TransactionTypeSchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionTypeSchemaEnum.FREE_LOOK_CANCELLATION,
    TransactionTypeSchemaEnum.NEW_LOAN,
    TransactionTypeSchemaEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];
