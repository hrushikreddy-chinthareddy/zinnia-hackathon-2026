'use client';
import { useState } from 'react';

import { MfaChallenge } from '@/components/mfa/mfa-challenge/MfaChallenge';
import { FormSteps } from '@/types/transactions';

import { SelectAuthenticationMethod } from './SelectAuthenticationMethod';

interface VerifyIdentityProps {
  closeCallback: () => void;
  onSuccess: () => void;
  onFailure: () => void;
  transactionDescription: string;
}

export const VerifyIdentity = ({
  closeCallback,
  transactionDescription,
  onSuccess,
  onFailure,
}: VerifyIdentityProps) => {
  const [verifyStep, setVerifyStep] = useState(FormSteps.VERIFY_IDENTITY);
  const [selectedMethodId, setSelectedMethodId] = useState<string>();

  const moveToCodeStep = (selectedMethodId: string) => {
    setSelectedMethodId(selectedMethodId);
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
    return (
      <MfaChallenge
        onChallengeSuccess={onSuccess}
        onChallengeFailure={onFailure}
        onCancel={closeCallback}
        selectedVerificationId={selectedMethodId}
      />
    );
  }
};
