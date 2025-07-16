'use client';

import { formatUSDollars } from '@/utils/currency';

import { Name } from '../pii/Name';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';

export const PaymentSubmitted = () => {
  const { state } = useOttp();
  const { paymentAmount, payorBank } = state;

  return (
    <>
      <div className="typography-content-body">
        <p>
          <span className="typography-content-body-bold">
            {formatUSDollars(paymentAmount.plain)}
          </span>{' '}
          one-time premium payment{' '}
          {payorBank && (
            <>
              <span>from</span>{' '}
              <span className="typography-content-body-bold">
                <Name displayName={payorBank.nameOnAccount} />
              </span>
            </>
          )}{' '}
          was submitted.{' '}
        </p>
        <p className="mt-xl">
          There will be a confirmation sent to your email shortly.
        </p>
      </div>
    </>
  );
};
