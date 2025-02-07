'use client';
import { useState } from 'react';

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

  if (verifyStep === FormSteps.VERIFY_IDENTITY) {
    return (
      <SelectAuthenticationMethod
        transactionDescription={transactionDescription}
        moveToNextStep={() => setVerifyStep(FormSteps.VERIFY_IDENTITY_CODE)}
        closeCallback={closeCallback}
      />
    );
  }

  if (verifyStep === FormSteps.VERIFY_IDENTITY_CODE) {
    // return <MfaChallenge enrollment="false" id={mfaToken}/>;
    return <div>ENTER IN CODE</div>;
  }
};
