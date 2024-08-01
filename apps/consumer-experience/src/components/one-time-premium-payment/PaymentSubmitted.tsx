'use client';
import { Link } from '@zinnia/bloom/components';

import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';

export const PaymentSubmitted = ({
  policyNumber,
  planCode,
}: Partial<PolicyRequestInputs>) => {
  const { state } = useOttp();
  const { paymentAmount, payorBank } = state;

  return (
    <>
      <h1>Submitted!</h1>
      <div className="typography-content-body">
        <p>
          <span className="typography-content-body-bold">
            {/* TODO: amount minus the fees */}
            {formatUSDollars(paymentAmount)}
          </span>{' '}
          one-time premium payment{' '}
          {payorBank && (
            <span className="typography-content-body-bold">
              from {payorBank?.nameOnAccount}
            </span>
          )}{' '}
          was submitted.{' '}
        </p>
        <p className="mt-xl">
          There will be a confirmation sent to your email shortly.
        </p>
        <div className={premiumStyles.buttonGroup}>
          <Link
            href={`/policies/${planCode}/${policyNumber}`}
            text="Back to policy overview"
            variant="button"
          />
          <Link
            href={`/policies/${planCode}/${policyNumber}/premium/history`}
            text="Go to payment history"
          />
        </div>
      </div>
    </>
  );
};
