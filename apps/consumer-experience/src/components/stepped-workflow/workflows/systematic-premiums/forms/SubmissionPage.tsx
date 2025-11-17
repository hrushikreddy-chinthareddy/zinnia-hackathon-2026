'use client';

import { DEFAULT_DATE_FORMAT } from '@zinnia/utils';
import dayjs from 'dayjs';

import { formatUSDollars } from '@/utils/currency';

import { useSystematicPremiums } from '../provider/useSystematicPremiums';
import { paymentFrequencyDisplay } from '../utils';

export const SubmissionPage = () => {
  const { state } = useSystematicPremiums();
  const { paymentFrequency, paymentAmount, nextPaymentDate } =
    state.systematicPremiumAmountStep;

  return (
    <div>
      <p
        className="typography-content-body"
        style={{ marginBottom: 'var(--measure-dimension-gap-lg)' }}
      >
        We received a request to process a payment for&nbsp;
        <b>{formatUSDollars(paymentAmount)}</b>{' '}
        <b>{paymentFrequencyDisplay(paymentFrequency)?.toLowerCase()}</b>{' '}
        starting <b>{dayjs(nextPaymentDate).format(DEFAULT_DATE_FORMAT)}</b>.
      </p>
      <p className="typography-content-body-sm">
        There will be a confirmation sent to your email shortly.
      </p>
    </div>
  );
};
