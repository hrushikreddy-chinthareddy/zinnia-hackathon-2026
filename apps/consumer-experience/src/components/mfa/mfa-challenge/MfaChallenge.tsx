'use client';
import { FieldStatus, Label } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Loading from '@/app/loading';
import styles from '@/app/login/Login.module.css';
import { Button } from '@/components/button/Button';
import { FieldDataActive } from '@/components/field/data-active/FieldDataActive';
import {
  sendMfaChallenge,
  verifyMfaChallenge,
} from '@/components/mfa/mfa-actions';
import { MfaPhoneNumber } from '@/components/mfa/phone-number/MfaPhoneNumber';
import { useUser } from '@/hooks/use-user';
import { MfaAuthenticator, User } from '@/types/auth';
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
  const { user, setUser } = useUser();

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
    // We have to call this even on post login (after calling the authentication_methods call) because
    // this call retrieves more specific data about the authenticator chosen
    const fetchAuthenticators = async () => {
      try {
        const token = getMfaToken();
        // This is being called here rather than using the ServerApi class because
        // it needs the recently retrieve mfa token
        const response = await fetch('/api/auth/mfa/authenticators', {
          credentials: 'include',
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        // TODO: what should this do on fail?
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
          // TODO: what happens if the user doesn't have this active authenticator
          // should we be checking for active as well?
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
        onChallengeFailure?.();
        return;
      }
    };

    if (!authenticator) {
      fetchAuthenticators();
    }
  }, [authenticator, id, onChallengeFailure, selectedVerificationId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const response = await verifyMfaChallenge({
      ...authenticator,
      ...data,
      enrollment,
    });

    if (response && !response.error) {
      onChallengeSuccess?.();
      // If there is an onCancel function passed in, we assume that this component
      // is being used post login, in which case we need to set the user context
      // so that any client side components that retrieve the user context via
      // the useUser hook, will be getting the up to date stepUpTime reset during
      // mfa verification. If we don't do this the client side components will be retriving
      // the user info set on initial render via the UserProvider in layout
      if (onCancel) {
        setUser({ ...user, stepUpTime: response.stepUpTime } as User);
      }
    } else if (response.error === 'invalid_grant') {
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
    const resendResponse = await sendMfaChallenge({
      challengeType: authenticator?.authenticator_type || '',
      authenticatorId: authenticator?.id || '',
      loggingContext: {
        file: 'MfaChallenge.tsx',
        function: 'handleResendCode',
      },
    });

    if ('success' in resendResponse && resendResponse.success) {
      setResendCode(false);
    } else {
      setResendCode(false);
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
    return <Loading />;
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
              id="mfa-code"
              label={
                <Label labelFor="mfa-code">
                  <span className="sr-only">code</span>
                </Label>
              }
              value={field.value || ''}
              inputMode="numeric"
              fieldStatus={
                errors.code ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              errorMessage={errors.code?.message?.toString()}
              placeholder="Enter your code"
            />
          )}
        />
      </div>
      <p className={styles.resend}>
        {getDisclaimerText(authenticator?.oob_channel || '')}{' '}
        <Button
          onClick={handleResendCode}
          className={clsx(
            'text-link-primary',
            styles.small,
            styles.spinnerButton
          )}
          size="small"
          mode="link"
          loading={resendCode}
          disabled={resendCode}
        >
          <span>Re-send verification code.</span>
        </Button>
      </p>
      <div className="stacked-items">
        <Button
          expand
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className={clsx('mt-3xl', styles.submit)}
        >
          <span>Continue</span>
        </Button>
        {onCancel && (
          <Button
            mode="link"
            onClick={onCancel}
            style={{
              alignSelf: 'center',
              width: 'fit-content',
              marginTop: 'var(--measure-dimension-gap-lg)',
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
