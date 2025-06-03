import { selectBankSchema } from '@/components/providers/one-time-premium-payment/types';
import {
  payeeStepSchema,
  taxWithholdingStepSchema,
  withdrawalAmountStepSchema,
  withdrawalMethodStepSchema,
} from '@/components/providers/withdrawals/types';
import { StepInfo } from '@/components/stepped-workflow/types';

import { WithdrawalSteps, withdrawalUrls } from './types';

export const stepsInfo: Record<WithdrawalSteps, StepInfo> = {
  [WithdrawalSteps.INTRO]: {
    title: 'Ready To Make a Withdrawal?',
    order: null,
    url: withdrawalUrls[WithdrawalSteps.INTRO],
  },
  [WithdrawalSteps.AMOUNT]: {
    title: 'Withdrawal Amount',
    order: 1,
    url: withdrawalUrls[WithdrawalSteps.AMOUNT],
    requiredData: withdrawalAmountStepSchema,
  },
  [WithdrawalSteps.METHOD]: {
    title: 'Withdrawal Method',
    order: 2,
    url: withdrawalUrls[WithdrawalSteps.METHOD],
    requiredData: withdrawalMethodStepSchema,
  },
  [WithdrawalSteps.WITHHOLDINGS]: {
    title: 'Tax Withholdings',
    order: 3,
    url: withdrawalUrls[WithdrawalSteps.WITHHOLDINGS],
    requiredData: taxWithholdingStepSchema,
  },
  [WithdrawalSteps.PAYEE]: {
    title: 'Payee',
    order: 4,
    url: withdrawalUrls[WithdrawalSteps.PAYEE],
    requiredData: payeeStepSchema,
  },
  [WithdrawalSteps.DISTRIBUTION]: {
    title: 'Distribution Method',
    order: 5,
    url: withdrawalUrls[WithdrawalSteps.DISTRIBUTION],
    requiredData: selectBankSchema,
  },
  [WithdrawalSteps.SUMMARY]: {
    title: 'summary',
    order: 6,
    url: withdrawalUrls[WithdrawalSteps.SUMMARY],
  },
  [WithdrawalSteps.MFA]: {
    title: 'verify your identity',
    order: null,
    url: withdrawalUrls[WithdrawalSteps.MFA],
    actions: {
      primary: null,
      secondary: null,
    },
  },
  [WithdrawalSteps.SUBMITTED]: {
    title: 'Submitted!',
    order: 7,
    url: withdrawalUrls[WithdrawalSteps.SUBMITTED],
  },
};
