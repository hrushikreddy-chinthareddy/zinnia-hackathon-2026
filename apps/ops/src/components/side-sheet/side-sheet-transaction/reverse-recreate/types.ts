import { TransactionStatus } from "@deps/models/policy/sor-policy";

import { BaseCardModel } from "../types";

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

export interface SideSheetReversedTransactionModel extends BaseCardModel {
    values: ReverseTransactionSidesheetValues;
}
