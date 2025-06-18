'use client';

import {
  paymentFrequencyEnum,
  SPPaymentFrequency,
} from '@/components/providers/systematic-premiums/types';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { formatUSDollars } from '@/utils/currency';

const frequencyLabels: Record<SPPaymentFrequency, string> = {
  [paymentFrequencyEnum.Values.MONTHLY]: 'month',
  [paymentFrequencyEnum.Values.QUARTERLY]: '3 months',
  [paymentFrequencyEnum.Values.SEMIANNUAL]: '6 months',
  [paymentFrequencyEnum.Values.ANNUAL]: 'year',
};

export const SubmissionPage = () => {
  const { state } = useSystematicPremiums();
  const { paymentFrequency, paymentAmount, effectiveDate } =
    state.systematicPremiumAmountStep;

  return (
    <>
      <div>
        <p className="typography-content-body">
          We received a request to process a payment for&nbsp;
          <b>{formatUSDollars(paymentAmount)}</b> every{' '}
          <b>{frequencyLabels[paymentFrequency]}</b> starting{' '}
          <b>{effectiveDate}</b>
        </p>
        <p className="typography-content-body-sm">
          There will be a confirmation sent to your email shortly.
        </p>
      </div>
    </>
  );
};
