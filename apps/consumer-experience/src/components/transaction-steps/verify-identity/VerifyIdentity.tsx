'use client';
import { useState } from 'react';

import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';

import { MfaChallenge } from './MfaChallenge';
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
  const [selectedMethodId, setSelectedMethodId] = useState<string>();

  const moveToCodeStep = (selectedMethodId: string) => {
    setSelectedMethodId(selectedMethodId);
    setVerifyStep(FormSteps.VERIFY_IDENTITY_CODE);
  };

  const backToTransactionStep = () => {
    setVerifyStep(FormSteps.CONFIRM);
  };

  const transactionError = () => {
    setVerifyStep(FormSteps.CONFIRM);
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
    return (
      <MfaChallenge
        onChallengeSuccess={backToTransactionStep}
        onChallengeFailure={transactionError}
        // closeCallback={closeCallback}
        selectedVerificationId={selectedMethodId}
      />
    );
  }
};
