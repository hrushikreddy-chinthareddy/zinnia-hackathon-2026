import { StepInfo } from '@/components/stepped-workflow/types';
import { FreeLookCancelUrlPaths } from '@/components/stepped-workflow/workflows/free-look-cancel/provider/types';

export const stepsInfo: Record<FreeLookCancelUrlPaths, StepInfo> = {
  [FreeLookCancelUrlPaths.INFO]: {
    title: 'Are you sure you want to cancel?',
    excludeFromProgress: true,
    url: FreeLookCancelUrlPaths.INFO,
  },
  [FreeLookCancelUrlPaths.DATE]: {
    title: 'Cancel Policy',
    url: FreeLookCancelUrlPaths.DATE,
  },
  [FreeLookCancelUrlPaths.PAYEE]: {
    title: 'Payee',
    url: FreeLookCancelUrlPaths.PAYEE,
  },
  [FreeLookCancelUrlPaths.DISTRIBUTION]: {
    title: 'Distribution Method',
    url: FreeLookCancelUrlPaths.DISTRIBUTION,
  },
  [FreeLookCancelUrlPaths.SUMMARY]: {
    title: 'Summary',
    url: FreeLookCancelUrlPaths.SUMMARY,
  },
  [FreeLookCancelUrlPaths.MFA]: {
    title: 'Verify Your Identity',
    excludeFromProgress: true,
    url: FreeLookCancelUrlPaths.MFA,
  },
  [FreeLookCancelUrlPaths.SUBMITTED]: {
    title: 'Got it!',
    url: FreeLookCancelUrlPaths.SUBMITTED,
  },
};
