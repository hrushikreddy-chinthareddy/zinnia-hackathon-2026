import {
  AllocationOption,
  AmountType,
  DisbursementPaymentForm,
  DisbursementType,
  PartyRole,
  TaxRateToUse,
} from '@zinnia/api-types/types/bpm';
import { FilingStatus } from '@zinnia/api-types/types/sor';
import { z } from 'zod';

export enum WithdrawalSteps {
  INTRO = 'introduction',
  AMOUNT = 'amount',
  METHOD = 'method',
  WITHHOLDINGS = 'withholdings',
  PAYEE = 'payee',
  DISTRIBUTION = 'distribution',
  SUMMARY = 'summary',
  SUBMITTED = 'submitted',
  MFA = 'multi-factor-auth',
}

export enum WithdrawalsAction {
  SET_CURRENT_PAGE = 'setCurrentPage',
  SET_WITHDRAWAL_AMOUNT_STEP = 'setWithdrawalAmountStep',
  SET_WITHDRAWAL_METHOD_STEP = 'setWithdrawalMethodStep',
  SET_WITHDRAWAL_TAX_WITHHOLDING_STEP = 'setWithdrawalTaxWithholdingStep',
  SET_WITHDRAWAL_PAYEE_STEP = 'setWithdrawalPayeeStep',
  SET_WITHDRAWAL_DISTRIBUTION_METHOD_STEP = 'setWithdrawalDistributionMethodStep',
}

export const RadioOptionEnum = z.enum(['minimum', 'maximum', 'other']);
export type RadioOptionType = z.infer<typeof RadioOptionEnum>;
export const amountTypeEnum = z.enum([
  AmountType.MAX,
  AmountType.WITHDRAWALUNTILBASIS,
  AmountType.AMOUNT,
]);

export const withdrawalAmountStepSchema = z.object({
  effectiveDate: z.string().min(1, 'Effective date is required'),
  amountType: amountTypeEnum,
  paymentAmount: z.coerce.number().min(1).optional(),
  withdrawalType: z.enum([DisbursementType.GROSS, DisbursementType.NET]),
});

export const withdrawalMethodStepSchema = z.object({
  withdrawalMethod: z.enum([
    AllocationOption.PRORATA,
    AllocationOption.DEFAULT,
  ]),
});

export const taxWithholdingAmountTypeEnum = z.enum([
  'dollar',
  'percentage',
  'minimum',
  'none',
]);
export const taxWithholdingSchema = z.object({
  taxRateToUse: z.enum([
    TaxRateToUse.USEDEFAULTTABLE,
    TaxRateToUse.USEVALUESENTERED,
    TaxRateToUse.NOWITHHOLDINGELECTED,
  ]),
  amountType: taxWithholdingAmountTypeEnum,
  dollar: z.string().min(0, 'Amount must be a positive number'),
  percentage: z.string().min(0, 'Amount must be a positive number'),
  exemptions: z.string().min(0, 'Exemptions must be a non-negative number'),
  filingStatus: z
    .enum([FilingStatus.DEFAULT, FilingStatus.SINGLE, FilingStatus.MARRIED])
    .optional(),
  taxJurisdiction: z.string().min(1, 'Tax jurisdiction is required').optional(),
});

// TODO: verify that these are necessary, i copied these over from otpp because
// i didn't want to import from another workflow's types
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

export const selectBankSchema = z.object({
  // This validates against `YYYY-MM-DD` from zod, which is same as ZAHARA_DATE_FORMAT
  effectiveDate: z.string().date(),
  paymentAmount: paymentAmountSchema,
});

export const taxWithholdingStepSchema = z.object({
  federal: taxWithholdingSchema,
  state: taxWithholdingSchema,
});

export const bankAccountSchema = z.object({
  accountNumber: z.string().optional(),
  bankId: z.string().optional(),
  branchName: z.string().optional(),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  autopayEnabled: z.boolean().optional(),
});

export const addressSchema = z.object({
  addressId: z.string().optional(),
  addrCountry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  addrLine1: z.string().optional(),
  addrLine2: z.string().optional(),
  addrLine3: z.string().optional(),
  zipExt: z.string().optional(),
});

export const payeeStepSchema = z.object({
  payeeName: z.string(),
  payeePartyId: z.string(),
  partyRole: z
    .enum([
      PartyRole.AGENT,
      PartyRole.PRIMARYBENEFICIARY,
      PartyRole.CONTINGENTBENEFICIARY,
      PartyRole.OWNER,
      PartyRole.PAYEE,
      PartyRole.PAYOR,
    ])
    .optional(),
});

export const distributionMethodStepSchema = z.object({
  distributionType: z.enum([
    DisbursementPaymentForm.CHECK,
    DisbursementPaymentForm.ACH,
  ]),
  bank: bankAccountSchema.optional(),
  address: addressSchema.optional(),
});

export const WithdrawalStepsSchema = z.nativeEnum(WithdrawalSteps);

export const WithdrawalsStateSchema = z.object({
  currentPage: WithdrawalStepsSchema,
  taxWithholdingsStep: taxWithholdingStepSchema,
  distributionMethodStep: distributionMethodStepSchema,
  withdrawalAmountStep: withdrawalAmountStepSchema,
  withdrawalMethodStep: withdrawalMethodStepSchema,
  payeeStep: payeeStepSchema,
});

export type WithdrawalsState = z.infer<typeof WithdrawalsStateSchema>;

export const payloadSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(WithdrawalsAction.SET_CURRENT_PAGE),
    payload: WithdrawalsStateSchema.pick({
      currentPage: true,
    }),
  }),
  z.object({
    type: z.literal(WithdrawalsAction.SET_WITHDRAWAL_AMOUNT_STEP),
    payload: WithdrawalsStateSchema.pick({
      withdrawalAmountStep: true,
    }),
  }),
  z.object({
    type: z.literal(WithdrawalsAction.SET_WITHDRAWAL_METHOD_STEP),
    payload: WithdrawalsStateSchema.pick({
      withdrawalMethodStep: true,
    }),
  }),
  z.object({
    type: z.literal(WithdrawalsAction.SET_WITHDRAWAL_TAX_WITHHOLDING_STEP),
    payload: WithdrawalsStateSchema.pick({
      taxWithholdingsStep: true,
    }),
  }),
  z.object({
    type: z.literal(WithdrawalsAction.SET_WITHDRAWAL_PAYEE_STEP),
    payload: WithdrawalsStateSchema.pick({
      payeeStep: true,
    }),
  }),
  z.object({
    type: z.literal(WithdrawalsAction.SET_WITHDRAWAL_DISTRIBUTION_METHOD_STEP),
    payload: WithdrawalsStateSchema.pick({
      distributionMethodStep: true,
    }),
  }),
]);

export type Action = z.infer<typeof payloadSchema>;
export type Dispatch = (action: Action) => void;
