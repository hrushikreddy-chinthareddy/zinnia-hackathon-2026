import { z } from 'zod';

import { PaymentMethod } from '@/types/payment';

export enum OttpSteps {
  AMOUNT = 'amount',
  BANK = 'bank',
  SUMMARY = 'summary',
  SUBMITTED = 'submitted',
}

export enum OttpAction {
  SET_EFFECTIVE_DATE = 'setEffectiveDate',
  SET_PAYMENT_AMOUNT = 'setPaymentAmount',
  SET_PAYOR_BANK = 'setPayorBank',
  SET_PAYMENT_SUBMIT_STATUS = 'setPaymentSubmitStatus',
  SET_PAYMENT_FEE = 'setPaymentFee',
  RESET = 'reset',
}

const payorBankSchema = z.object({
  bankId: z.string(),
  appliesToPartyId: z.string(),
}) satisfies z.ZodType<Partial<PaymentMethod>>;

export const paymentAmountSchema = z.object({
  plain: z
    .number()
    .min(1)
    .refine(amount => amount >= 1, {
      message: 'Amount must be greater than 0',
    }),
  withFees: z
    .number()
    .min(1)
    .refine(amount => amount >= 1, {
      message: 'Amount must be greater than 0',
    }),
});

export const summarySchema = z.object({
  payorBank: payorBankSchema,
});

export const selectBankSchema = z.object({
  // This validates against `YYYY-MM-DD` from zod, which is same as ZAHARA_DATE_FORMAT
  effectiveDate: z.string().date(),
  paymentAmount: paymentAmountSchema,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action = { type: OttpAction; payload?: any };
export type Dispatch = (action: Action) => void;
export interface OttpState {
  effectiveDate: string;
  paymentAmount: z.infer<typeof paymentAmountSchema>;
  payorBank: PaymentMethod;
  paymentFee?: number;
}
