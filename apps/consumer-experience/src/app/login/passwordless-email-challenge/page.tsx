import { redirect } from 'next/navigation';

import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { PasswordlessEmailChallenge } from '@/components/login/PasswordlessEmailChallenge';
import { getFeatureFlags } from '@/services/feature-flags';
import { getCookie } from '@/utils/auth';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { LOGIN_EMAIL_COOKIE_KEY } from '@/utils/serverClientUtils';

import { GenericLoginPage } from '../GenericLoginPage';

export default async function PasswordlessEmailChallengePage() {
  const featureFlagDecisions = await getFeatureFlags();

  // This is to protect against the edge case where a user has this step saved in their
  // history and are trying to login but have not yet entered their email
  // we don't want to show a blank email field on the enter a code page
  const userEmailCookie = await getCookie(LOGIN_EMAIL_COOKIE_KEY);
  if (!userEmailCookie) {
    return redirect('/login');
  }

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    return (
      <GenericInfoPage
        title="Enter your code."
        description="Check for an email from us with your 6-digit verification code."
        action={<PasswordlessEmailChallenge />}
      />
    );
  }

  return (
    <GenericLoginPage
      title="Enter your code."
      description="Check for an email from us with your 6-digit verification code."
      action={<PasswordlessEmailChallenge />}
    />
  );
}
