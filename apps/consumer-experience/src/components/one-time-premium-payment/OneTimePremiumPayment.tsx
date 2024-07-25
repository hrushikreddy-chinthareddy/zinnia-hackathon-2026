'use client';

import { toSentenceCase } from '@zinnia/utils';
import { cloneElement, useState } from 'react';

import { HeaderLink } from '@/components/header-link/HeaderLink';

import styles from './OneTimePremiumPayment.module.css';
import { PaymentSubmittedSuccess } from './PaymentSubmittedSuccess';
import { PaymentSummary } from './PaymentSummary';
import { SelectAmount } from './SelectAmount';
import { SelectBank } from './SelectBank';
import { HeaderButton } from '../header-link/HeaderButton';
import { ProgressBarSteps } from '../progress-bar-steps/ProgressBarSteps';
import { OttpProvider } from '../providers/one-time-premium-payment/OttpProvider';

const getSteps = (planCode: string, policyNumber: string) => {
  return [
    {
      component: (
        <SelectAmount planCode={planCode} policyNumber={policyNumber} />
      ),
      title: 'Make a One-Time Premium Payment',
    },
    {
      component: <SelectBank planCode={planCode} policyNumber={policyNumber} />,
      title: 'Select payment method',
    },
    {
      component: (
        <PaymentSummary planCode={planCode} policyNumber={policyNumber} />
      ),
      title: 'summary',
    },
    // TODO: this is the final step ONLY if the payment was successful
    {
      component: <PaymentSubmittedSuccess />,
      title: 'Submitted',
    },
  ];
};

export const OneTimePremiumPayment = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getSteps(planCode, policyNumber);

  const moveToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const returnToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <OttpProvider>
      <div className={`${styles.steps} flex-center mb-xl`}>
        <span className="typography-labels-label-sm mr-lg">Step</span>
        <ProgressBarSteps
          totalSteps={steps.length}
          currentStep={currentStep + 1}
          className={styles.progressBar}
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
          planCode,
          policyNumber,
        })}
    </OttpProvider>
  );
};
