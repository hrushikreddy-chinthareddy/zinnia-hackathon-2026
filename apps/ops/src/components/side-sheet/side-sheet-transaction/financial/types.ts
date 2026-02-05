import { SchemaEnum } from '@zinnia/api-types/types/sor';

export interface BaseFinancialTransactionSideSheetModel {
    content?: string;
    transactionType?: string;
    title?: string;
}

export const FinancialTransactionTypes: SchemaEnum[] = [
    SchemaEnum.PAYMENT_INITIAL_PREMIUM,
    SchemaEnum.INITIAL_PREMIUM,
    SchemaEnum.ONE_TIME_PREMIUM,
    SchemaEnum.PAYMENT_ONE_TIME_PREMIUM,
    SchemaEnum.SUBSEQUENT_PAYMENT,
    SchemaEnum.SUBSEQUENT_PREMIUM,
    SchemaEnum.FULL_SURRENDER,
    SchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    SchemaEnum.FREE_LOOK_CANCELLATION,
    SchemaEnum.NEW_LOAN,
    SchemaEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];
