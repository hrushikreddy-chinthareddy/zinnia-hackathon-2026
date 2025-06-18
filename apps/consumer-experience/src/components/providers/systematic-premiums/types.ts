import { Frequency } from '@xd/api-types/dist/generated-types/bpm';
import { z } from 'zod';

import { SystematicPremiumSteps } from '@/components/workflows/systematic-premiums/steps';

export enum SystematicPremiumsAction {
  SET_ACTIVE_SYSTEMATIC_PROGRAM = 'setActiveSystematicProgram',
  SET_CURRENT_PAGE = 'setCurrentPage',
  SET_SYSTEMATIC_PREMIUM_AMOUNT_STEP = 'setSystematicPremiumAmountStep',
  SET_SYSTEMATIC_PREMIUM_METHOD_STEP = 'setSystematicPremiumMethodStep',
  SET_SYSTEMATIC_PREMIUM_TAX_WITHHOLDING_STEP = 'setSystematicPremiumTaxWithholdingStep',
  SET_SYSTEMATIC_PREMIUM_PAYOR_STEP = 'setSystematicPremiumPayorStep',
  SET_SYSTEMATIC_PREMIUM_DISTRIBUTION_METHOD_STEP = 'setSystematicPremiumDistributionMethodStep',
}

export const paymentFrequencyEnum = z.enum([
  Frequency.MONTHLY,
  Frequency.QUARTERLY,
  Frequency.SEMIANNUAL,
  Frequency.ANNUAL,
]);

export type SPPaymentFrequency = z.infer<typeof paymentFrequencyEnum>;

export const systematicPremiumAmountStepSchema = z.object({
  effectiveDate: z.string().min(1, 'Effective date is required'),
  paymentFrequency: paymentFrequencyEnum,
  paymentAmount: z.number().min(1),
});

export type SPAmountStepSchema = z.infer<
  typeof systematicPremiumAmountStepSchema
>;

export const payorSchema = z
  .object({
    payorName: z.string(),
    payorPartyId: z.string(),
  })
  .optional();

export const bankAccountSchema = z
  .object({
    accountNumber: z.string().optional(),
    bankId: z.string().optional(),
    branchName: z.string().optional(),
    bankName: z.string().optional(),
    accountType: z.string().optional(),
    autopayEnabled: z.boolean().optional(),
  })
  .optional();

export const selectBankStepSchema = z.object({
  bank: bankAccountSchema,
  payor: payorSchema,
});

export type SPSelectBankStepSchema = z.infer<typeof selectBankStepSchema>;

export const systematicPremiumStepsSchema = z.nativeEnum(
  SystematicPremiumSteps
);

export const systematicPremiumsStateSchema = z.object({
  currentPage: systematicPremiumStepsSchema,
  activeArrangementId: z.string().optional(),
  yearlyPremiumAmount: z.number().min(0, 'Amount must be a positive number'),
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
    type: z.literal(SystematicPremiumsAction.SET_CURRENT_PAGE),
    payload: systematicPremiumsStateSchema.pick({
      currentPage: true,
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
