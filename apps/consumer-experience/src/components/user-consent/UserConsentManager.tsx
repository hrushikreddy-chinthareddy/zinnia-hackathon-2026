'use client';

import {
  AssistiveText,
  AssistiveTextVariant,
  Checkbox,
  LoaderVariant,
  SpinnerButton,
} from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { setUserConsent } from '@/actions/user-consent-actions';
import { useUser } from '@/hooks/use-user';

import styles from './UserConsent.module.css';
import { Footer } from '../footer/Footer';

const default_error =
  'You must agree to the Privacy Policy and Terms of Use to continue.';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <SpinnerButton
      type="submit"
      disabled={pending}
      variant={LoaderVariant.CTA}
      hide={!pending}
    >
      Continue
    </SpinnerButton>
  );
};

export const UserConsentManager = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const [state, formAction] = useFormState(setUserConsent, {
    acceptedTermsAndConditions: user?.hasSignedTermsAndConditions || false,
    user: user,
  });
  const [consentError, setConsentError] = useState<null | string>(null);

  useEffect(() => {
    if (state?.error) {
      setConsentError(state?.errorDescription || default_error);
    }

    // if the user accepted the terms but our use context isn't updated reload the page to get the latest state
    if (
      state?.acceptedTermsAndConditions &&
      !state?.user?.hasSignedTermsAndConditions
    ) {
      window.location.reload();
    }
  }, [state]);

  if (
    state?.acceptedTermsAndConditions &&
    state?.user?.hasSignedTermsAndConditions
  ) {
    return <>{children}</>;
  }

  const updateConsentChecked = () => {
    setConsentError(null);
  };

  return (
    <div className="container">
      <div className="card">
        <form action={formAction}>
          <input type="hidden" name="partyId" value={user?.partyId} />
          <div>
            <p className="typography-content-body mb-3xl">
              This site uses cookies and other technologies to enable and
              improve functionality, analyze site use, and generate analytics.
              See our Privacy Policy for details. By ticking the check box, you
              agree to our{' '}
              <a
                href="https://zinnia.com/terms-of-use/"
                className="typography-content-body-bold"
              >
                Terms of Use
              </a>{' '}
              and{' '}
              <a
                href="https://zinnia.com/privacy-policy/"
                className="typography-content-body-bold"
              >
                Privacy Policy
              </a>
              .
            </p>
            <Checkbox
              showError={!!consentError}
              name="acceptedTermsAndConditions"
              onClick={updateConsentChecked}
              id="terms-and-conditions-consent"
            >
              <span>I agree to the Terms of Use and the Privacy Policy</span>
            </Checkbox>
          </div>
          {consentError && (
            <div aria-live="polite">
              <AssistiveText
                className="mt-lg"
                text="You must agree to the Privacy Policy and Terms of Use to continue."
                variant={AssistiveTextVariant.Error}
              />
            </div>
          )}
          <div className={styles.buttonContainer}>
            <SubmitButton />
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};
