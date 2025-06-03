import { PaymentForm } from '@xd/api-types/dist/generated-types/bpm';
import { z } from 'zod';

import { WithdrawalSteps } from '@/components/workflows/withdrawals/types';

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

export const withdrawalAmountStepSchema = z.object({
  effectiveDate: z.string().min(1, 'Effective date is required'),
  radioOption: RadioOptionEnum,
  paymentAmount: z.coerce.number().min(1).optional(),
  withdrawalType: z.enum(['GROSS', 'NET']),
});

export const withdrawalMethodStepSchema = z.object({
  withdrawalMethod: z.union([z.literal('prorata'), z.literal('other')]),
});

export const taxWithholdingStepSchema = z.object({
  federal: z.object({
    type: z.enum([
      'dollar',
      'percentage',
      'minimum',
      'none',
    ]),
    amount: z.string().min(0, 'Amount must be a positive number'),
  }),
  state: z.object({
    type: z.enum([
      'dollar',
      'percentage',
      'minimum',
      'none',
    ]),
    amount: z.string().min(0, 'Amount must be a positive number'),
  }),
});

export const payeeStepSchema = z.object({
  payeeName: z.string().optional(),
  payeePartyId: z.string(),
});

export const distributionMethodStepSchema = z.object({
  distributionType: z.enum([PaymentForm.ACH,PaymentForm.CHECK]),
  bank: z
    .object({
      accountNumber: z.string(),
      bankId: z.string().optional(),
      branchName: z.string().optional(),
      bankName: z.string().optional(),
      accountType: z.string().optional(),
      autopayEnabled: z.boolean().optional(),
    })
    .optional(),
  address: z
    .object({
      addressId: z.string(),
      addrCountry: z.string(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      addrLine1: z.string().optional(),
      addrLine2: z.string().optional(),
      addrLine3: z.string().optional(),
      zipExt: z.string().optional(),
    })
    .optional(),
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
    payload: z.object({
      currentPage: WithdrawalsStateSchema.pick({
        currentPage: true,
      }),
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

export type Action = {
  type: WithdrawalsAction;
  // payload: z.infer<typeof payloadSchema>;
  payload: any;
};
export type Dispatch = (action: Action) => void;
