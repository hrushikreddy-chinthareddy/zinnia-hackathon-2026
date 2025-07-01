import { DisbursementType } from '@zinnia/api-types/types/bpm';

export enum WithdrawalType {
    Surrender = 'surrender',
    Partial = 'partial',
    Default = '',
}

export type AmountType = {
    amount: number;
    disbursementType: DisbursementType;
    effectiveDate: string;
    paymentAmount: string;
    type: WithdrawalType;
    withdrawalAmount?: string;
    withdrawalCustomAmount?: string;
};
