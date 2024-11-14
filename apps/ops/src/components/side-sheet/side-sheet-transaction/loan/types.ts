import { PayeePaymentDetails } from "../types";

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
    payeePaymentDetails: PayeePaymentDetails[];
    processDate: string;
    processedAmount?: number | null;
    status?: string;
    submittedAmount?: number;
} & InterestRateValue;
