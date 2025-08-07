import { SurrenderSteps } from '@/components/providers/surrender/types';
import { StepInfo } from '@/components/stepped-workflow/types';

export const surrenderUrls: Record<SurrenderSteps, string> = {
  [SurrenderSteps.INFO]: 'information',
  [SurrenderSteps.AMOUNT]: 'amount',
  [SurrenderSteps.TAX]: 'tax',
  [SurrenderSteps.PAYEE]: 'payee',
  [SurrenderSteps.BANK]: 'bank',
  [SurrenderSteps.SUMMARY]: 'summary',
  [SurrenderSteps.MFA]: 'verify-identity',
  [SurrenderSteps.SUBMITTED]: 'submitted',
};

export const stepsInfo: Record<SurrenderSteps, StepInfo> = {
  [SurrenderSteps.INFO]: {
    title: 'Confirm Surrender',
    order: null,
    url: surrenderUrls[SurrenderSteps.INFO],
  },
  [SurrenderSteps.AMOUNT]: {
    title: 'Date',
    order: 1,
    url: surrenderUrls[SurrenderSteps.AMOUNT],
  },
  [SurrenderSteps.TAX]: {
    title: 'Tax Withholdings',
    order: 2,
    url: surrenderUrls[SurrenderSteps.TAX],
  },
  [SurrenderSteps.PAYEE]: {
    title: 'Payee',
    order: 3,
    url: surrenderUrls[SurrenderSteps.PAYEE],
  },
  [SurrenderSteps.BANK]: {
    title: 'Distribution Method',
    order: 4,
    url: surrenderUrls[SurrenderSteps.BANK],
  },
  [SurrenderSteps.SUMMARY]: {
    title: 'Summary',
    order: 5,
    url: surrenderUrls[SurrenderSteps.SUMMARY],
  },
  [SurrenderSteps.MFA]: {
    title: 'Verify your identity',
    order: null,
    url: surrenderUrls[SurrenderSteps.MFA],
    actions: {
      primary: null,
      secondary: null,
    },
  },
  [SurrenderSteps.SUBMITTED]: {
    title: 'Got it!',
    order: 7,
    url: surrenderUrls[SurrenderSteps.SUBMITTED],
  },
};
