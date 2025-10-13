import { Frequency } from '@xd/api-types/dist/generated-types/bpm';
import { z } from 'zod';

export enum SystematicPremiumSteps {
  AMOUNT = 'amount',
  BANK = 'bank',
  SUMMARY = 'summary',
  SUBMITTED = 'submitted',
}

export enum SystematicPremiumsAction {
  SET_ACTIVE_SYSTEMATIC_PROGRAM = 'setActiveSystematicProgram',
  SET_SYSTEMATIC_PREMIUM_AMOUNT_STEP = 'setSystematicPremiumAmountStep',
  SET_SYSTEMATIC_PREMIUM_METHOD_STEP = 'setSystematicPremiumMethodStep',
  SET_SYSTEMATIC_PREMIUM_TAX_WITHHOLDING_STEP = 'setSystematicPremiumTaxWithholdingStep',
  SET_SYSTEMATIC_PREMIUM_PAYOR_STEP = 'setSystematicPremiumPayorStep',
  SET_SYSTEMATIC_PREMIUM_DISTRIBUTION_METHOD_STEP = 'setSystematicPremiumDistributionMethodStep',
}

export type SPPaymentFrequency = Frequency;

export const systematicPremiumAmountStepSchema = z.object({
  nextPaymentDate: z.string().min(1, 'Next payment date is required'),
  paymentFrequency: z.nativeEnum(Frequency).optional(),
  paymentAmount: z.coerce
    .number({
      invalid_type_error: 'Amount must be greater than 0',
    })
    .min(1, 'Amount must be greater than 0')
    .refine(amount => amount >= 1, {
      message: 'Amount must be greater than 0',
    }),
});

export type SPAmountStepSchema = z.infer<
  typeof systematicPremiumAmountStepSchema
>;

// TODO: I don't really like recreating BPM types in ZOD
// feels treachorous
export const selectBankStepSchema = z.object({
  bankId: z.string(),
  appliesToPartyId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  nameOnAccount: z.string(),
  accountStatus: z.string(),
  accountType: z.string(),
  accountNumber: z.string(),
  routingNumber: z.string(),
  // internationalBankAccountNumberobject
  branchName: z.string(),
  // branchAddressobject
  branchPhoneNumber: z.string(),
});

// TODO: this is a copy from one-time-premium-payment, maybe move to a common file?
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

// TODO: this is a copy from one-time-premium-payment, maybe move to a common file?
export const selectBankSchema = z.object({
  // This validates against `YYYY-MM-DD` from zod, which is same as ZAHARA_DATE_FORMAT
  effectiveDate: z.string().date(),
  paymentAmount: paymentAmountSchema,
});

export type SPSelectBankStepSchema = z.infer<typeof selectBankStepSchema>;

export const systematicPremiumStepsSchema = z.nativeEnum(
  SystematicPremiumSteps
);

export const systematicPremiumsStateSchema = z.object({
  activeArrangementId: z.string().optional(),
  currentSystematicPremium: z.any().optional() || {},
  selectBankStep: selectBankStepSchema,
  systematicPremiumAmountStep: systematicPremiumAmountStepSchema,
});

export type SystematicPremiumsState = z.infer<
  typeof systematicPremiumsStateSchema
>;

export const actionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(SystematicPremiumsAction.SET_ACTIVE_SYSTEMATIC_PROGRAM),
    payload: systematicPremiumsStateSchema.pick({
      activeArrangementId: true,
    }),
  }),
  z.object({
    type: z.literal(
      SystematicPremiumsAction.SET_SYSTEMATIC_PREMIUM_AMOUNT_STEP
    ),
    payload: systematicPremiumsStateSchema.pick({
      systematicPremiumAmountStep: true,
    }),
  }),
  z.object({
    type: z.literal(
      SystematicPremiumsAction.SET_SYSTEMATIC_PREMIUM_DISTRIBUTION_METHOD_STEP
    ),
    payload: systematicPremiumsStateSchema.pick({
      selectBankStep: true,
    }),
  }),
]);

export type Action = z.infer<typeof actionSchema>;
export type Dispatch = (action: Action) => void;
