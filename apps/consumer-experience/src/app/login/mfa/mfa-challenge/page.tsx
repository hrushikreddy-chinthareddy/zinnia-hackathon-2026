'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  Loader,
  LoaderVariant,
  SpinnerButton,
} from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import {
  resendMfaChallenge,
  verifyMfaChallenge,
} from '@/actions/login-actions';
import styles from '@/app/login/Login.module.css';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaAuthenticator } from '@/types/auth';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

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

export default function MfaChallengePage({
  searchParams,
}: {
  searchParams: { enrollment?: string; id?: string };
}) {
  const router = useRouter();
  const [resendCode, setResendCode] = useState(false);
  const [verifyMfaChallengeState, verifyMfaChallengeFormAction] = useFormState(
    verifyMfaChallenge,
    {
      error: '',
      error_description: '',
    }
  );
  const [authenticator, setAuthenticators] = useState<MfaAuthenticator>();
  const [resendCodeState, resendCodeFormAction] = useFormState(
    resendMfaChallenge,
    {
      success: null,
    }
  );

  const getMfaToken = () => {
    const cookies = Cookies.get();
    const keys = Object.keys(cookies)
      .filter(key => key.startsWith('_ztm'))
      .sort((a, b) => {
        const numA = parseInt(a.split('.')[1] || '');
        const numB = parseInt(b.split('.')[1] || '');
        return numA - numB;
      });

    return keys.map(key => cookies[key]).join('');
  };
  useEffect(() => {
    const fetchAuthenticators = async () => {
      let redirectToErrorPage = false;
      try {
        const token = getMfaToken();
        const response = await fetch('/api/auth/mfa/authenticators', {
          credentials: 'include',
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.status === 200) {
          const authenticators = data as MfaAuthenticator[];
          let authenticator: MfaAuthenticator | undefined;
          if (searchParams?.id) {
            const idParts = searchParams.id.split('|');
            const [channelType, lastFourOfPhoneNumber] = idParts;
            authenticator = authenticators.find(
              a =>
                a.oob_channel === channelType &&
                a.name?.includes(lastFourOfPhoneNumber || '')
            );
          } else {
            authenticator = authenticators.find(
              a => ['voice', 'sms'].includes(a.oob_channel || '') && a.active
            );
          }
          setAuthenticators(authenticator);
        } else {
          throw new Error('unauthorized');
        }
      } catch (error) {
        redirectToErrorPage = true;
      }
      if (redirectToErrorPage) {
        router.push('/login/error');
      }
    };
    fetchAuthenticators();
  }, [router, searchParams.id]);

  const hasError = !!verifyMfaChallengeState.error;
  const inputStyles = clsx(`${styles.input}`, {
    [`${styles.inValid}`]: hasError,
  });

  const handleResendCode = () => {
    setResendCode(true);
    const formData = new FormData();
    formData.append('authenticator', authenticator?.id || '');
    formData.append('challengeType', authenticator?.authenticator_type || '');
    resendCodeFormAction(formData);
  };

  if (
    resendCode &&
    'success' in resendCodeState &&
    resendCodeState.success !== null
  ) {
    setResendCode(false);
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const digits = phoneNumber.slice(-4);
    return `1 (***) ***-${digits}`;
  };

  const getDisclaimerText = (oobChannel: string) => {
    if (oobChannel === 'sms') {
      return 'Didn’t receive a text?';
    }

    if (oobChannel === 'voice') {
      return 'Didn’t receive a call?';
    }

    return DEFAULT_ERROR_STRING;
  };

  const form = () => {
    return (
      <form
        className={`${styles.form} typography-content-body-sm`}
        action={verifyMfaChallengeFormAction}
        noValidate
      >
        <input
          type="hidden"
          name="enrollment"
          value={searchParams?.enrollment}
        />
        {authenticator?.id && (
          <input
            type="hidden"
            name="authenticatorId"
            value={authenticator?.id}
          />
        )}
        {authenticator?.authenticator_type && (
          <input
            type="hidden"
            name="authenticatorType"
            value={authenticator?.authenticator_type}
          />
        )}
        <div className={styles.formGroup}>
          <div className="typography-content-value">
            {formatPhoneNumber(authenticator?.name || '')}
          </div>
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
                text={verifyMfaChallengeState.error_description}
              />
            </div>
          )}
        </div>
        <p className={styles.resend}>
          {getDisclaimerText(authenticator?.oob_channel || '')}{' '}
          <SpinnerButton
            onClick={handleResendCode}
            className={clsx(
              'text-link-primary',
              styles.small,
              styles.spinnerButton
            )}
            size="small"
            mode="link"
            variant={LoaderVariant.CTA}
            hide={!resendCode}
            disabled={resendCode}
          >
            Re-send verification code.
          </SpinnerButton>
        </p>
        <SubmitButton />
      </form>
    );
  };

  return (
    <GenericInfoPage
      title="Enter your code."
      description="Enter your 6-digit verification code."
      action={
        <div>
          {!authenticator && <Loader />}
          {authenticator && form()}
        </div>
      }
    />
  );
}
