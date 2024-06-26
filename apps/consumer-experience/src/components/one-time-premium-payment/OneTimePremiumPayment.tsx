'use client';
import { HeaderLink } from '@/components/header-link/HeaderLink';
import { Button } from '@zinnia/bloom/components';

import styles from './OneTimePremiumPayment.module.css';
import { SelectAmount } from './SelectAmount';
import { useMemo, useState } from 'react';
import { SelectBank } from './SelectBank';

export const OneTimePremiumPayment = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const currentStepComponent = useMemo(() => {
    switch (currentStep) {
      case 1:
        // TODO: pass in method to update data
        return <SelectAmount />;
      case 2:
        return <SelectBank />;
      // TODO: what should the default be here?
      default:
        return 'Select Amount';
    }
  }, [currentStep]);

  const nextStepButtonText = useMemo(() => {
    switch (currentStep) {
      case 3:
        return 'Submit payment';
      // TODO: what should the default be here?
      default:
        return 'Continue';
    }
  }, [currentStep]);

  const nextStepHeaderText = useMemo(() => {
    switch (currentStep) {
      case 1:
        return 'One-Time Premium Payment';
      case 2:
        return 'Select Payment Method';
      case 3:
        return 'Summary';
      // TODO: what should the default be here?
      default:
        return 'One-Time Premium Payment';
    }
  }, [currentStep]);

  return (
    <>
      {currentStep === 1 ? (
        <HeaderLink
          className="mb-xl"
          title="Make a One-Time Payment"
          link={{
            url: `/policies/${planCode}/${policyNumber}/premium`,
            label: 'return to payment page',
          }}
        />
      ) : (
        // {/* TODO: how to do this to return to previous step, should be a button not a link */}
        <HeaderLink className="mb-xl" title={nextStepHeaderText} />
      )}

      {currentStepComponent}
      <div className={styles.buttonGroup}>
        <Button mode="primary" onClick={() => setCurrentStep(currentStep + 1)}>
          {nextStepButtonText}
        </Button>
        {/* TODO: show 'are you sure path', this should actually be a link */}
        <Button mode="link">Cancel</Button>
      </div>
    </>
  );
};

// TODO:
// on refresh, go back to step 1?
// allow className bloom label
// underline on cancel button is too spaced out
