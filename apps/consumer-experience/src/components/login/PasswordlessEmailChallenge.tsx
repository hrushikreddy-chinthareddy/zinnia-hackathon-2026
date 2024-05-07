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
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import {
  resendVerificationCode,
  verifyPasswordlessStartChallenge,
} from '@/actions/login-actions';
import styles from '@/app/login/Login.module.css';

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

export const PasswordlessEmailChallenge = ({ email }: { email: string }) => {
  const userEmail = decodeURIComponent(email);
  const [resendPasswordlessStartCode, setResendPasswordlessStartCode] =
    useState(false);
  const [resendPasswordlessStartCodeState, passwordlessStartFormAction] =
    useFormState(resendVerificationCode, {
      success: false,
    });
  const [
    verifyPasswordlessStartChallengeState,
    verifyPasswordlessStartChallengeFormAction,
  ] = useFormState(verifyPasswordlessStartChallenge, {
    error: '',
    error_description: '',
  });

  const hasError = !!verifyPasswordlessStartChallengeState.error;
  const resendCodeError =
    'error' in resendPasswordlessStartCodeState &&
    !resendPasswordlessStartCodeState.error;
  const inputStyles = clsx(`${styles.input}`, {
    [`${styles.inValid}`]: hasError,
  });

  const handleResendPasswordlessStartCode = () => {
    setResendPasswordlessStartCode(true);
    const formData = new FormData();
    formData.append('email', userEmail);
    passwordlessStartFormAction(formData);
  };

  if (
    (resendPasswordlessStartCode &&
      'success' in resendPasswordlessStartCodeState &&
      resendPasswordlessStartCodeState.success) ||
    ('error' in resendPasswordlessStartCodeState &&
      resendPasswordlessStartCodeState.error === 'bad.connection')
  ) {
    setResendPasswordlessStartCode(false);
    if ('success' in resendPasswordlessStartCodeState) {
      resendPasswordlessStartCodeState.success = false;
    }
  }
  return (
    <form
      className={`${styles.form} typography-content-body-sm`}
      action={verifyPasswordlessStartChallengeFormAction}
      noValidate
    >
      <input type="hidden" name="email" value={userEmail} />
      <div className={styles.formGroup}>
        <input
          aria-label="Enter your email"
          type="email"
          className={styles.input}
          defaultValue={decodeURIComponent(userEmail)}
          disabled
        />
        <Icon className={styles.icon} type={IconType.MAIL} />
      </div>
      <div>
        <div className={styles.formGroup}>
          <input
            aria-label="Enter your code"
            type="text"
            id="code"
            className={inputStyles}
            placeholder="Enter your code"
            name="code"
          />
        </div>
        {hasError && (
          <div className="py-lg">
            <AssistiveText
              variant={AssistiveTextVariant.Error}
              text={verifyPasswordlessStartChallengeState.error_description}
            />
          </div>
        )}
      </div>
      <p className={styles.resend}>
        Didn't receive an email?{' '}
        <SpinnerButton
          onClick={handleResendPasswordlessStartCode}
          className={clsx(
            'text-link-primary',
            styles.small,
            styles.spinnerButton
          )}
          size="small"
          mode="link"
          variant={LoaderVariant.CTA}
          hide={!resendPasswordlessStartCode}
          disabled={resendPasswordlessStartCode}
        >
          Re-send verification code.
        </SpinnerButton>
      </p>
      {resendCodeError && (
        <div className="py-lg">
          <AssistiveText
            variant={AssistiveTextVariant.Error}
            text={resendPasswordlessStartCodeState.error_description}
          />
        </div>
      )}
      <SubmitButton />
    </form>
  );
};
