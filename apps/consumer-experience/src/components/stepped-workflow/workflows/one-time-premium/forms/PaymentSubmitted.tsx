'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Name } from '@/components/pii/Name';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { formatUSDollars } from '@/utils/currency';

import { useOttp } from '../provider/OttpContext';
import { OttpAction } from '../provider/types';

export const PaymentSubmitted = () => {
  const { state, dispatch } = useOttp();
  const router = useRouter();
  const { currentStep, cancelUrl } = useSteppedWorkflowContext();
  // store the state locally and then clear the context state
  // so that we can do validation in this component
  const [submittedPayment] = useState(state);
  const { paymentAmount, payorBank } = submittedPayment;

  useEffect(() => {
    dispatch({ type: OttpAction.RESET });
  }, [dispatch]);

  // Redirect if the user does not have current form data. This is to prevent
  // a user from going to a screen after a transaction, then clicking the back button
  // and seeing $0 dollars submitted
  if (!currentStep.requiredData?.safeParse(submittedPayment)?.success) {
    router.push(cancelUrl);
  }

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
