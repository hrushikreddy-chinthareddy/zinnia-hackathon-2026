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
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { passwordlessStart } from '@/actions/login-actions';
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
      Continue
    </SpinnerButton>
  );
};

export const EnterEmailStep = () => {
  const [state, formAction] = useFormState(passwordlessStart, {
    error: '',
    error_description: '',
    timestamp: new Date(),
  });
  const [currentError, setCurrentError] = useState('');
  const prevTimestamp = useRef(state.timestamp);

  const inputStyles = clsx(`${styles.input}`, {
    [`${styles.inValid}`]: currentError,
  });

  useEffect(() => {
    setCurrentError(state.error_description);

    // Include timestamp in order to differentiate subsequent submits
    // error message may be the same if user submits multiple times with wrong
    // email, so this useEffect wouldn't trigger
    prevTimestamp.current = state.timestamp;
  }, [state.error_description, state.timestamp]);

  return (
    <form
      className={`${styles.form} typography-content-body-sm`}
      action={formAction}
      noValidate
    >
      <div>
        <div className={styles.formGroup}>
          <input
            aria-label="Enter your email"
            type="email"
            id="email"
            className={inputStyles}
            placeholder="Enter your email"
            name="email"
            onChange={e => {
              setCurrentError('');
            }}
          />
          {!currentError && (
            <Icon className={styles.icon} type={IconType.MAIL} />
          )}
          {currentError && (
            <Icon
              className={styles.icon}
              type={IconType.ALERT_EXCLAMATION}
              color="var(--color-fields-border-field-border-error)"
            />
          )}
        </div>
        {currentError && (
          <div className="py-lg">
            <AssistiveText
              variant={AssistiveTextVariant.Error}
              text={state.error_description}
            />
          </div>
        )}
      </div>
      <p className="typography-content-caption text-left">
        By clicking Continue, you understand and agree that you are responsible
        for the security of your devices and any tokens used for passwordless
        login and you will take all necessary precautions to safeguard your
        devices and tokens.
      </p>
      <SubmitButton />
    </form>
  );
};
