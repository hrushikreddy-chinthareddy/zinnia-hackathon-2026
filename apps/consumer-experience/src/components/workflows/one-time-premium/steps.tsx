import {
  OttpSteps,
  paymentAmountSchema,
  selectBankSchema,
  summarySchema,
} from '@/components/providers/one-time-premium-payment/types';
import { StepInfo } from '@/components/stepped-workflow/types';

export const oneTimePremiumUrls: Record<OttpSteps, string> = {
  [OttpSteps.AMOUNT]: 'amount',
  [OttpSteps.BANK]: 'bank',
  [OttpSteps.SUMMARY]: 'summary',
  [OttpSteps.SUBMITTED]: 'submitted',
};

export const stepsInfo: Record<OttpSteps, StepInfo> = {
  [OttpSteps.AMOUNT]: {
    title: 'Make a one-time payment',
    order: 1,
    url: oneTimePremiumUrls[OttpSteps.AMOUNT],
    requiredData: paymentAmountSchema,
  },
  [OttpSteps.BANK]: {
    title: 'select payment method',
    order: 2,
    url: oneTimePremiumUrls[OttpSteps.BANK],
    requiredData: selectBankSchema,
  },
  [OttpSteps.SUMMARY]: {
    title: 'summary',
    order: 3,
    url: oneTimePremiumUrls[OttpSteps.SUMMARY],
    requiredData: selectBankSchema.merge(summarySchema),
  },
  [OttpSteps.SUBMITTED]: {
    title: 'submitted!',
    order: 4,
    url: oneTimePremiumUrls[OttpSteps.SUBMITTED],
    requiredData: selectBankSchema.merge(summarySchema),
    actions: {
      primary: {
        text: 'Go Back to Coverage Page',
      },
      secondary: {
        text: 'Go to payment history',
      },
    },
  },
};
