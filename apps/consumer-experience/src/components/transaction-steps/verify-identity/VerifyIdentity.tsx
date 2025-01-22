import { Button } from '@zinnia/bloom/components';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { MfaOptions } from '@/components/mfa-options/MfaOptions';
import { PhoneNumber } from '@/components/pii/PhoneNumber';
import { BankFormFields } from '@/types/bank';

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
  return (
    <form>
      <h3 className="typography-mobile-headline-3-m">Verify your identity</h3>
      <div className="my-xl">
        <p>
          For your security, we're sending a one-time code to the phone number
          associated with your account. This helps us confirm it's you{' '}
          {transactionDescription}
        </p>
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
        {/* TODO: ensure this uses the right theme color */}
        {/* Not using the bloom component here because the label is different and also needs to be side by side */}
        <MfaOptions />
      </div>
      <p className="typography-nav-links-sm-inline">
        If you no longer have access to this number, please give us a call at{' '}
        <CarrierPhoneNumber /> for assistance.
      </p>
      <div className={styles.buttonContainer}>
        <Button>Send code</Button>
        <Button onClick={closeCallback} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
