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
  // TODO: this validation only really works if we have data returning from the API OR user can
  // input their own value
  paymentAmount: z.number().nullish(),
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
