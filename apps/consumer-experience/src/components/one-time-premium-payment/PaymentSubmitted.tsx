'use client';
import { Link, Loader } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import { FormHeader } from './FormHeader';
import premiumStyles from './OneTimePremiumPayment.module.css';
import { oneTimePremiumSteps, Steps } from './steps';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';

export const PaymentSubmitted = ({
  policyNumber,
  planCode,
}: PolicyRequestInputs) => {
  const { state } = useOttp();
  const { paymentAmount, payorBank } = state;
  const currentStepInfo = oneTimePremiumSteps[Steps.SUBMITTED];
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const prevStepUrl = currentStepInfo.prevUrl({
      planCode,
      policyNumber,
    });
    const validation = currentStepInfo?.requiredData?.safeParse(state);
    if (
      (validation && !validation.success) ||
      Object.keys(state.payorBank).length === 0
    ) {
      router.push(prevStepUrl);
    } else {
      setIsValidating(false);
    }
  }, [currentStepInfo, planCode, policyNumber, router, state]);

  if (isValidating) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '550px',
          justifyContent: 'center',
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <>
      <FormHeader currentStep={Steps.SUBMITTED} />
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
