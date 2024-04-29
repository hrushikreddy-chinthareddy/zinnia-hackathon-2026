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
import { useFormState, useFormStatus } from 'react-dom';

import { passwordlessStart } from '@/actions/login-actions';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';

import styles from './Login.module.css';

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

export default function LoginPage() {
  const [state, formAction] = useFormState(passwordlessStart, {
    error: '',
    error_description: '',
  });

  const hasError = !!state.error;
  const inputStyles = clsx(`${styles.input}`, {
    [`${styles.inValid}`]: hasError,
  });

  return (
    <GenericInfoPage
      title="What’s your email?"
      description="Enter the email associated with your policy, and we’ll send you a verification code."
      action={
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
              />
              {!hasError && (
                <Icon className={styles.icon} type={IconType.MAIL} />
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
              <div className="py-lg">
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text={state.error_description}
                />
              </div>
            )}
          </div>
          <p className="typography-content-caption text-left">
            By clicking Continue, you understand and agree that you are
            responsible for the security of your devices and any tokens used for
            passwordless login and you will take all necessary precautions to
            safeguard your devices and tokens.
          </p>
          <SubmitButton />
        </form>
      }
    />
  );
}
