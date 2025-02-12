'use client';
import {
  Button,
  FieldStatus,
  Loader,
  LoaderVariant,
  SpinnerButton,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  resendMfaChallenge,
  verifyMfaChallenge,
} from '@/actions/login-actions';
import styles from '@/app/login/Login.module.css';
import { FieldDataActive } from '@/components/field/data-active/FieldDataActive';
import { MfaPhoneNumber } from '@/components/mfa/phone-number/MfaPhoneNumber';
import { MfaAuthenticator } from '@/types/auth';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

// TODO: move this into utils, however this is currently a clientside version
// need to either un-serverside the utils file or pass cookies or something
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

export const MfaChallenge = ({
  selectedVerificationId,
  onChallengeSuccess,
  onChallengeFailure,
  enrollment,
  id,
  onCancel,
}: {
  /**
   * If user selects a specific verification method, we can send in the method
   */
  selectedVerificationId?: string;
  onChallengeSuccess?: () => void;
  onChallengeFailure?: () => void;
  enrollment?: string;
  id?: string;
  onCancel?: () => void;
}) => {
  const [resendCode, setResendCode] = useState(false);
  const [authenticator, setAuthenticators] = useState<MfaAuthenticator>();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      code: null,
    },
  });

  useEffect(() => {
    const fetchAuthenticators = async () => {
      try {
        const token = getMfaToken();
        const response = await fetch('/api/auth/mfa/authenticators', {
          credentials: 'include',
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        // TODO: test this
        if (response.status !== 200) {
          //TODO: Should this always log user out?
          // prolly not if it's just auth0 api is down for whatever reason
          onChallengeFailure?.();
          return;
        }

        const data = await response.json();
        const authenticators = data as MfaAuthenticator[];

        let authenticator: MfaAuthenticator | undefined;
        if (id) {
          const idParts = id.split('|');
          const [channelType, lastFourOfPhoneNumber] = idParts;
          authenticator = authenticators.find(
            a =>
              a.oob_channel === channelType &&
              a.name?.includes(lastFourOfPhoneNumber || '')
          );
        } else if (selectedVerificationId) {
          authenticator = authenticators.find(
            a => a.id === selectedVerificationId
          );
          setAuthenticators(authenticator);
        } else {
          authenticator = authenticators.find(
            a => ['voice', 'sms'].includes(a.oob_channel || '') && a.active
          );
        }
        setAuthenticators(authenticator);
      } catch (error) {
        console.log('error in mfa challenge', error);
        onChallengeFailure?.();
        return;
        // TODO: set to show error component in sidesheet
      }
    };
    fetchAuthenticators();
  }, [id, onChallengeFailure, selectedVerificationId]);

  const onSubmit = async (data: any) => {
    const response = await verifyMfaChallenge({
      ...authenticator,
      ...data,
      enrollment,
    });
    console.log('submit mfa challenge response', response);
    if (!response.error) {
      console.log('mfa challenge success');
      onChallengeSuccess?.();
    }
    if (response.error === 'invalid_grant') {
      setError('code', {
        type: 'custom',
        message: 'This code’s not right. Try again.',
      });
    } else {
      onChallengeFailure?.();
    }
  };

  const handleResendCode = async () => {
    setResendCode(true);
    const resendResponse = await resendMfaChallenge({
      challengeType: authenticator?.authenticator_type,
      authenticatorId: authenticator?.id,
    });

    if (resendCode && 'success' in resendResponse && resendResponse.success) {
      setResendCode(false);
    } else {
      // TODO: what happens if this does return an error?
      // I hit the rate limit and it just spun...think it needs to redirect to error
      onChallengeFailure?.();
    }
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

  if (!authenticator) {
    return <Loader />;
  }

  return (
    <form
      className={`${styles.form} typography-content-body-sm`}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className={styles.formGroup}>
        <div>
          <p>
            Please enter the verification code sent to{' '}
            <MfaPhoneNumber phoneNumber={authenticator?.name || ''} />
          </p>
        </div>
      </div>
      <div>
        <Controller
          name="code"
          control={control}
          rules={{
            required: true,
            minLength: { value: 6, message: 'Code must be 6 digits' },
          }}
          render={({ field }) => (
            <FieldDataActive
              {...field}
              label={<label className="sr-only">Code</label>}
              value={field.value || ''}
              inputMode="numeric"
              fieldStatus={
                errors.code ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              errorMessage={errors.code?.message}
              placeholder="Enter your code"
            />
          )}
        />
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
          <span>Re-send verification code.</span>
        </SpinnerButton>
      </p>
      <div className="stacked-items">
        <SpinnerButton
          expand
          type="submit"
          disabled={isSubmitting}
          variant={LoaderVariant.CTA}
          hide={!isSubmitting}
          className={clsx('mt-3xl', styles.submit)}
        >
          <span>Continue</span>
        </SpinnerButton>
        {onCancel && (
          <Button mode="link" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
