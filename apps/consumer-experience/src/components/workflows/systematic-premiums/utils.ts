/**
 * TODO: Replace this file with API implementation after it is ready
 * see ticket `ZSOR-15155`
 */
import { Frequency as BPMFrequency } from '@xd/api-types/dist/generated-types/sor';

import { SPPaymentFrequency } from '@/components/providers/systematic-premiums/types';
import { DEFAULT_ERROR_STRING } from '@xd/utils/dist';
import { Frequency } from '@xd/api-types/dist/generated-types/bpm';

export const PaymentFrequencyMap: Partial<
  Record<
    SPPaymentFrequency,
    {
      label: string;
    }
  >
> = {
  [BPMFrequency.MONTHLY]: {
    label: 'Every month',
  },
  [BPMFrequency.QUARTERLY]: {
    label: 'Every 3 months',
  },
  [BPMFrequency.SEMIANNUAL]: {
    label: 'Every 6 months',
  },
  [BPMFrequency.ANNUAL]: {
    label: 'Every year',
  },
};

export const paymentFrequencyDisplay = (frequency?: Frequency) => {
  switch (frequency) {
    case BPMFrequency.MONTHLY:
      return 'Every month';
    case BPMFrequency.QUARTERLY:
      return 'Every 3 months';
    case BPMFrequency.SEMIANNUAL:
      return 'Every 6 months';
    case BPMFrequency.ANNUAL:
      return 'Every year';
    default:
      return DEFAULT_ERROR_STRING;
  }
};
