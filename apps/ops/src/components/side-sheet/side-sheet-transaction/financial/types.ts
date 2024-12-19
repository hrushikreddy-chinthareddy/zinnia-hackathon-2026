import { TransactionType } from '@deps/models/policy/sor-policy';

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
    TransactionType.NewLoan,
];
