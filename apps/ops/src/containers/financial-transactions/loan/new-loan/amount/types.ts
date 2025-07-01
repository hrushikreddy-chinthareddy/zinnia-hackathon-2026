import { DisbursementType } from '@zinnia/api-types/types/sor';
export type AmountType = {
    amount: number;
    disbursementType: DisbursementType;
    effectiveDate: string;
    paymentAmount: string;
    loanAmount?: string;
    loanCustomAmount?: string;
};
