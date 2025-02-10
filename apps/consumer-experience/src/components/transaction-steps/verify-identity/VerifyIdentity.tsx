'use client';
import { useState } from 'react';

import { MfaChallenge } from '@/components/login/MfaChallenge';
import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';

import { SelectAuthenticationMethod } from './SelectAuthenticationMethod';

interface VerifyIdentityProps {
  closeCallback: () => void;
  onSuccess: (requestValues: BankFormFields) => Promise<void>;
  transactionDescription: string;
}

export const VerifyIdentity = ({
  closeCallback,
  transactionDescription,
}: VerifyIdentityProps) => {
  const [verifyStep, setVerifyStep] = useState(FormSteps.VERIFY_IDENTITY);

  const moveToCodeStep = () => {
    setVerifyStep(FormSteps.VERIFY_IDENTITY_CODE);
  };

  if (verifyStep === FormSteps.VERIFY_IDENTITY) {
    return (
      <SelectAuthenticationMethod
        transactionDescription={transactionDescription}
        moveToNextStep={moveToCodeStep}
        closeCallback={closeCallback}
      />
    );
  }

  if (verifyStep === FormSteps.VERIFY_IDENTITY_CODE) {
    return <MfaChallenge enrollment="false" postLogin />;
  }
};
