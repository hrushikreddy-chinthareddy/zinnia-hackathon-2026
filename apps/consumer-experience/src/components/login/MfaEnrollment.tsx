'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  Icon,
  IconType,
  LoaderVariant,
  SpinnerButton,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useState, FocusEvent } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { associateMfa } from '@/actions/login-actions';
import styles from '@/app/login/Login.module.css';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <SpinnerButton
      expand
      type="submit"
      disabled={pending}
      variant={LoaderVariant.CTA}
      hide={!pending}
      className={clsx('mt-3xl', styles.submit)}
    >
      <span>Continue</span>
    </SpinnerButton>
  );
};

export const MfaEnrollment = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [state, formAction] = useFormState(associateMfa, {
    error: '',
    error_description: '',
  });

  const hasError = !!state.error;
  const inputStyles = clsx(`${styles.input} ${styles.phone}`, {
    [`${styles.inValid}`]: hasError,
  });

  const onPhoneNumberBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const cleanedPhoneNumber = value.replace(/\D/g, '');
      const match = cleanedPhoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        setPhoneNumber(`(${match[1]}) ${match[2]}-${match[3]}`);
      }
    }
  };

  return (
    <form
      className={`${styles.form} typography-content-body-sm`}
      action={formAction}
      noValidate
    >
      <input type="hidden" name="countryCode" value="+1" />
      <div>
        <div className={styles.formGroup}>
          <span className={styles.countryCode}>+1</span>
          <input
            aria-label="Enter your phone number"
            type="text"
            id="phone-number"
            className={inputStyles}
            placeholder="(XXX) XXX-XXXX"
            name="phoneNumber"
            value={phoneNumber}
            onBlur={onPhoneNumberBlur}
            onChange={e => setPhoneNumber(e.target.value)}
          />

          {!hasError && <Icon className={styles.icon} type={IconType.PHONE} />}
          {hasError && (
            <Icon
              className={styles.icon}
              type={IconType.ALERT_EXCLAMATION}
              color="var(--color-fields-border-field-border-error)"
            />
          )}
        </div>
        {hasError && (
          <div className="mt-lg">
            <AssistiveText
              variant={AssistiveTextVariant.Error}
              text={state.error_description}
            />
          </div>
        )}
      </div>
      <fieldset className={styles.mfaOptionsContainer}>
        <div>
          <legend>How would you like to receive the code?</legend>
          <div className={styles.mfaOptions}>
            <label className={styles.mfaOption}>
              <input type="radio" name="authenticatorType" value="sms" />
              Text
            </label>
            <label className={styles.mfaOption}>
              <input type="radio" name="authenticatorType" value="voice" />
              Call
            </label>
          </div>
        </div>
      </fieldset>
      <p className="typography-content-caption text-left">
        By inputting your mobile number and clicking Continue, you are providing
        express written consent to Everly Life Insurance Company, Everly, LLC,
        and Zinnia Tech Solutions, LLC to call via live, automated, or
        prerecorded call or send text or SMS messages at the number you provided
        (message and data rates may apply and message frequency varies) for
        multi-factor authentication.
      </p>
      <SubmitButton />
    </form>
  );
};
