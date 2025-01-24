'use client';
import { Button } from '@zinnia/bloom/components';
import { useState } from 'react';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { PhoneNumber } from '@/components/pii/PhoneNumber';
import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';

import styles from './VerifyIdentity.module.css';

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
  // const [mfaToken, setMfaToken] = useState(null);

  const moveToCodeStep = () => {
    setVerifyStep(FormSteps.VERIFY_IDENTITY_CODE);
  };

  // useEffect(() => {
  // call https://auth0.com/docs/api/authentication?http#refresh-token to retrieve
  // set mfaToken with response from above
  // setMfaToken()
  // call following with mfa_token recieved from call above
  // const response = await fetch('/api/auth/mfa/authenticators', {
  // credentials: 'include',
  // headers: {
  //   authorization: `Bearer ${token}`,
  // },
  // });
  // }, []);

  if (verifyStep === FormSteps.VERIFY_IDENTITY) {
    return (
      <div>
        <h3 className="typography-mobile-headline-3-m mb-xl">
          Verify your identity
        </h3>
        <p>
          For your security, we're sending a one-time code to the phone number
          associated with your account. This helps us confirm it's you{' '}
          {transactionDescription}
        </p>
        <div className="mb-xl mt-lg">
          <p className="typography-labels-field-label">Mobile phone</p>
          {/* TODO: how to get this phone number */}
          {/* TODO: does this still need to be PII if it only shows last 4? */}
          <PhoneNumber
            phoneNumber={{
              countryCode: '1',
              areaCode: '318',
              dialNumber: '9873960',
            }}
          />
        </div>
        <p className="typography-nav-links-sm-inline mb-xl">
          If you no longer have access to this number, please give us a call at{' '}
          <CarrierPhoneNumber /> for assistance.
        </p>
        <div className={styles.buttonContainer}>
          <Button onClick={moveToCodeStep}>Send code</Button>
          <Button onClick={closeCallback} mode="link">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (verifyStep === FormSteps.VERIFY_IDENTITY_CODE) {
    // return <MfaChallenge enrollment="false" id={mfaToken}/>;
    <div>Enter in code</div>;
  }
};
