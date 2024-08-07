import { AccountType } from '@zinnia/api-types/types/sor';
import { z } from 'zod';

import { BankDetail } from '@/components/person-data/types';

export enum OttpAction {
  SET_EFFECTIVE_DATE = 'setEffectiveDate',
  SET_PAYMENT_AMOUNT = 'setPaymentAmount',
  SET_PAYOR_BANK = 'setPayorBank',
  SET_PAYMENT_SUBMIT_STATUS = 'setPaymentSubmitStatus',
  SET_PAYMENT_FEE = 'setPaymentFee',
}

const payorBankSchema = z.object({
  accountNumber: z.string(),
  accountType: z.nativeEnum(AccountType),
  routingNumber: z.string(),
  branchName: z.string(),
}) satisfies z.ZodType<Partial<BankDetail>>;

export const summarySchema = z.object({
  payorBank: payorBankSchema,
});

export const selectBankSchema = z.object({
  // This validates against `YYYY-MM-DD` from zod, which is same as ZAHARA_DATE_FORMAT
  effectiveDate: z.string().date(),
  paymentAmount: z.number().min(1),
});

export type Action = { type: OttpAction; payload: any };
export type Dispatch = (action: Action) => void;
export interface OttpState {
  // TODO: save in `YYYY-MM-DD` format to use zod validation
  effectiveDate: string;
  paymentAmount: number;
  payorBank: BankDetail;
  paymentFee?: number;
}
