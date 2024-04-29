'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  Icon,
  IconType,
  LoaderVariant,
  SpinnerButton,
} from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import { useState, FocusEvent } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { associateMfa } from '@/actions/login-actions';
import styles from '@/app/login/Login.module.css';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <SpinnerButton
      type="submit"
      disabled={pending}
      variant={LoaderVariant.CTA}
      hide={!pending}
      className={clsx('mt-3xl', styles.submit)}
    >
      Continue
    </SpinnerButton>
  );
};

export default function MfaEnrollmentPage() {
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
    <GenericInfoPage
      title="Let’s secure your account."
      description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
      action={
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

              {!hasError && (
                <Icon className={styles.icon} type={IconType.PHONE} />
              )}
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
            By inputting your number and clicking Continue, you are providing
            express consent to Everly Life Insurance Company, Everly, LLC, and
            Zinnia Technology Solutions, LLC to call or send text messages at
            the number you provided for multi-factor authentication.
          </p>
          <SubmitButton />
        </form>
      }
    />
  );
}
