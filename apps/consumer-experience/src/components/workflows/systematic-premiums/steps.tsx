import { selectBankSchema } from '@/components/providers/one-time-premium-payment/types';
import { systematicPremiumAmountStepSchema, SystematicPremiumSteps } from '@/components/providers/systematic-premiums/types';
import { StepInfo } from '@/components/stepped-workflow/types';


export const systematicPremiumUrls: Record<SystematicPremiumSteps, string> = {
  [SystematicPremiumSteps.AMOUNT]: 'amount',
  [SystematicPremiumSteps.BANK]: 'bank',
  [SystematicPremiumSteps.SUMMARY]: 'summary',
  [SystematicPremiumSteps.MFA]: 'verify-identity',
  [SystematicPremiumSteps.SUBMITTED]: 'submitted',
};

export const stepsInfo: Record<SystematicPremiumSteps, StepInfo> = {
  [SystematicPremiumSteps.AMOUNT]: {
    title: 'Set Up Premium Autopay',
    order: 1,
    url: systematicPremiumUrls[SystematicPremiumSteps.AMOUNT],
    requiredData: systematicPremiumAmountStepSchema,
  },
  [SystematicPremiumSteps.BANK]: {
    title: 'Payment Method',
    order: 2,
    url: systematicPremiumUrls[SystematicPremiumSteps.BANK],
    requiredData: selectBankSchema,
  },
  [SystematicPremiumSteps.SUMMARY]: {
    title: 'summary',
    order: 3,
    url: systematicPremiumUrls[SystematicPremiumSteps.SUMMARY],
    actions: {
      primary: {
        text: 'Submit Autopay'
      }
    }
  },
  [SystematicPremiumSteps.MFA]: {
    title: 'verify your identity',
    order: null,
    url: systematicPremiumUrls[SystematicPremiumSteps.MFA],
    actions: {
      primary: null,
      secondary: null,
    },
  },
  [SystematicPremiumSteps.SUBMITTED]: {
    title: 'Submitted!',
    order: 4,
    url: systematicPremiumUrls[SystematicPremiumSteps.SUBMITTED],
    actions: {
      primary: {
        text: 'Go Back to Coverage Page'
      }
    }
  },
};
