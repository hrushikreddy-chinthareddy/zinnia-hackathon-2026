'use client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@zinnia/bloom/components';
import { useState } from 'react';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { PhoneNumber } from '@/components/pii/PhoneNumber';
import { QueryKeys } from '@/queries/query-keys';
import { getUserAuthenticationMethods } from '@/queries/user-queries';
import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';

import styles from './VerifyIdentity.module.css';
import { Loading } from '../loading/Loading';

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
  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.USER_AUTHENTICATION_METHODS],
    queryFn: () => getUserAuthenticationMethods(),
  });

  console.log(data);

  const moveToCodeStep = () => {
    // call refreshToken endpoint
    // using token in return ->
    //     await setMfaCookie({
    //   value: data.mfa_token,
    // });
    setVerifyStep(FormSteps.VERIFY_IDENTITY_CODE);
  };

  if (isLoading) {
    return <Loading />;
  }

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
