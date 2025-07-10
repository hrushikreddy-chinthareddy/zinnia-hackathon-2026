/**
 * TODO: Replace this file with API implementation after it is ready
 * see ticket `ZSOR-15155`
 */
import {
  Frequency as BPMFrequency,
  PartyRole,
  SystematicProgram,
} from '@xd/api-types/dist/generated-types/sor';
import { DEFAULT_DATE_FORMAT } from '@xd/utils/dist';
import dayjs from 'dayjs';

import {
  paymentFrequencyEnum,
  SPPaymentFrequency,
} from '@/components/providers/systematic-premiums/types';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

export const getPaymentFrequency = (
  frequency?: BPMFrequency
): SPPaymentFrequency => {
  switch (frequency) {
    case BPMFrequency.MONTHLY: {
      return paymentFrequencyEnum.Enum.MONTHLY;
    }
    case BPMFrequency.QUARTERLY: {
      return paymentFrequencyEnum.Enum.QUARTERLY;
    }
    case BPMFrequency.SEMIANNUAL: {
      return paymentFrequencyEnum.Enum.SEMIANNUAL;
    }
    case BPMFrequency.ANNUAL: {
      return paymentFrequencyEnum.Enum.ANNUAL;
    }
  }
  return paymentFrequencyEnum.Enum.ANNUAL;
};

export const PaymentFrequencyMap: Record<
  SPPaymentFrequency,
  {
    label: string;
    divisor: number;
  }
> = {
  [paymentFrequencyEnum.Enum.MONTHLY]: {
    divisor: 12,
    label: 'Monthly',
  },
  [paymentFrequencyEnum.Enum.QUARTERLY]: {
    divisor: 4,
    label: 'Quarterly',
  },
  [paymentFrequencyEnum.Enum.SEMIANNUAL]: {
    divisor: 2,
    label: 'Semi-Annually',
  },
  [paymentFrequencyEnum.Enum.ANNUAL]: {
    divisor: 1,
    label: 'Annually',
  },
};

export const getPaymentByFrequency = (
  frequency: SPPaymentFrequency,
  amount: number
) => {
  const { divisor } = PaymentFrequencyMap[frequency];
  return amount / divisor;
};

export const getSystematicProgramTotalAmount = (
  frequency: SPPaymentFrequency,
  amount: number
) => {
  const { divisor } = PaymentFrequencyMap[frequency];
  return amount * divisor;
};

export const getFrequencyByPayment = (totalAmount: number, amount: number) => {
  for (const key in PaymentFrequencyMap) {
    const { divisor } = PaymentFrequencyMap[key as SPPaymentFrequency];
    const payment = amount * divisor;
    if (payment === totalAmount) {
      return key as SPPaymentFrequency;
    }
  }
  return paymentFrequencyEnum.Enum.ANNUAL;
};

export const getSystematicProgramAmounts = ({
  monthlyAmount = 100,
  bpmFrequency = BPMFrequency.ANNUAL,
  effectiveDate,
  parties,
}: {
  monthlyAmount?: number;
  bpmFrequency?: BPMFrequency;
  effectiveDate?: string;
  parties?: SystematicProgram['party'];
}): {
  bankId?: string;
  effectiveDate: string;
  monthlyAmount: number;
  paymentFrequency: SPPaymentFrequency;
  partyId?: string;
  totalAmount: number;
} => {
  const paymentFrequency = getPaymentFrequency(bpmFrequency);
  const totalAmount = getSystematicProgramTotalAmount(
    paymentFrequency,
    monthlyAmount
  );
  let currentDate = dayjs(effectiveDate, ZAHARA_DATE_FORMAT);

  // don't let people set a date in the past
  if (!currentDate.isValid() || currentDate.isBefore(dayjs())) {
    currentDate = dayjs();
  }

  const payor = parties?.find(party => party.partyRole === PartyRole.PAYOR);
  return {
    paymentFrequency,
    monthlyAmount,
    totalAmount,
    effectiveDate: currentDate.format(DEFAULT_DATE_FORMAT),
    bankId: payor?.bankId,
    partyId: payor?.partyId,
  };
};
