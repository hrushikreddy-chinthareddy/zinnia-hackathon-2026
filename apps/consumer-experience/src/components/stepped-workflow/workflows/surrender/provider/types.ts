import z from 'zod';

import {
  DisbursementPaymentForm,
  TaxRateToUse,
} from '@zinnia/api-types/types/bpm';

export enum SurrenderSteps {
  INFO = 'information',
  AMOUNT = 'amount',
  TAX = 'tax',
  PAYEE = 'payee',
  BANK = 'bank',
  SUMMARY = 'summary',
  MFA = 'multi-factor-auth',
  SUBMITTED = 'submitted',
}

export enum SurrenderAction {
  SET_CURRENT_PAGE = 'setCurrentPage',
  SET_SURRENDER_DATE_STEP = 'setSurrenderDateStep',
  SET_SURRENDER_TAX_WITHHOLDING_STEP = 'setSurrenderTaxWithholdingStep',
  SET_SURRENDER_PAYEE_STEP = 'setSurrenderPayeeStep',
  SET_SURRENDER_DISTRIBUTION_METHOD_STEP = 'setSurrenderDistributionMethodStep',
}

export const SurrenderStepsSchema = z.nativeEnum(SurrenderSteps);

export const taxWithholdingAmountTypeEnum = z.enum([
  'dollar',
  'percentage',
  'minimum',
  'none',
]);

export const taxWithHoldingSchema = z.object({
  taxRateToUse: z.enum([
    TaxRateToUse.USEDEFAULTTABLE,
    TaxRateToUse.USEVALUESENTERED,
    TaxRateToUse.NOWITHHOLDINGELECTED,
  ]),
  amountType: taxWithholdingAmountTypeEnum,
  dollar: z.string().min(0, 'Amount must be a positive number'),
  percentage: z.string().min(0, 'Amount must be a positive number'),
});

export const dateStepSchema = z.object({
  netSurrenderValue: z.number().min(0),
  surrenderDate: z.string().min(1, 'Effective date is required'),
});

export const taxWithHoldingStepSchema = z.object({
  federal: taxWithHoldingSchema,
  state: taxWithHoldingSchema,
});
export const payeeStepSchema = z.object({
  payeePartyId: z.string(),
  payeeName: z.string(),
});

export const distributionMethodStepSchema = z.object({
  distributionType: z.enum([
    DisbursementPaymentForm.ACH,
    DisbursementPaymentForm.CHECK,
  ]),
  address: z
    .object({
      addressId: z.string().optional(),
      addrCountry: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      addrLine1: z.string().optional(),
      addrLine2: z.string().optional(),
      addrLine3: z.string().optional(),
      zipExt: z.string().optional(),
    })
    .optional(),
  bank: z
    .object({
      bankId: z.string().optional(),
      branchName: z.string().optional(),
      accountType: z.string().optional(),
      accountNumber: z.string().optional(),
      autopayEnabled: z.boolean().optional(),
      appliesToPartyId: z.string().optional(),
    })
    .optional(),
});

export const surrenderStateSchema = z.object({
  currentPage: SurrenderStepsSchema,
  dateStep: dateStepSchema,
  taxWithholdingsStep: taxWithHoldingStepSchema,
  payeeStep: payeeStepSchema,
  distributionMethodStep: distributionMethodStepSchema,
});

export const payloadSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(SurrenderAction.SET_CURRENT_PAGE),
    payload: surrenderStateSchema.pick({
      currentPage: true,
    }),
  }),
  z.object({
    type: z.literal(SurrenderAction.SET_SURRENDER_DATE_STEP),
    payload: surrenderStateSchema.pick({
      dateStep: true,
    }),
  }),
  z.object({
    type: z.literal(SurrenderAction.SET_SURRENDER_DISTRIBUTION_METHOD_STEP),
    payload: surrenderStateSchema.pick({
      distributionMethodStep: true,
    }),
  }),
  z.object({
    type: z.literal(SurrenderAction.SET_SURRENDER_PAYEE_STEP),
    payload: surrenderStateSchema.pick({
      payeeStep: true,
    }),
  }),
  z.object({
    type: z.literal(SurrenderAction.SET_SURRENDER_TAX_WITHHOLDING_STEP),
    payload: surrenderStateSchema.pick({
      taxWithholdingsStep: true,
    }),
  }),
]);

export type SurrenderState = z.infer<typeof surrenderStateSchema>;
export type Action = z.infer<typeof payloadSchema>;
export type Dispatch = (action: Action) => void;
