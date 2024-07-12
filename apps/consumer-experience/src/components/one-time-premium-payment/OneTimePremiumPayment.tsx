'use client';
import { toSentenceCase } from '@zinnia/utils';
import { cloneElement, useState } from 'react';

import { HeaderLink } from '@/components/header-link/HeaderLink';

import styles from './OneTimePremiumPayment.module.css';
import { SelectAmount } from './SelectAmount';
import { SelectBank } from './SelectBank';
import { HeaderButton } from '../header-link/HeaderButton';
import { ProgressBarSteps } from '../progress-bar-steps/ProgressBarSteps';
import { PaymentSummary } from './PaymentSummary';

const steps = [
  {
    component: <SelectAmount />,
    title: 'Make a One-Time Premium Payment',
  },
  {
    component: <SelectBank />,
    title: 'Select payment method',
  },
  {
    component: <PaymentSummary />,
    title: 'summary',
  },
  // TODO: this is the final step ONLY if the payment was successful
  {
    compponent: <></>,
    title: 'Submitted',
  },
];

export const OneTimePremiumPayment = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const moveToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const returnToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <>
      <div className={`${styles.steps} flex-center mb-xl`}>
        <span className="typography-labels-label-sm mr-lg">Step</span>
        <ProgressBarSteps
          totalSteps={steps.length}
          currentStep={currentStep + 1}
        />
      </div>
      {currentStep === 0 ? (
        <HeaderLink
          className="mb-xl"
          title="Make a One-Time Payment"
          link={{
            url: `/policies/${planCode}/${policyNumber}/premium`,
            label: 'return to payment page',
          }}
        />
      ) : (
        <HeaderButton
          onClick={returnToPreviousStep}
          className="mb-xl"
          title={toSentenceCase(steps[currentStep]?.title)}
        />
      )}

      {steps[currentStep]?.component &&
        cloneElement(steps[currentStep]?.component || <></>, {
          moveToNextStep,
        })}
    </>
  );
};

// TODO:
// on refresh, go back to step 1?
// allow className bloom label
// underline on cancel button is too spaced out
