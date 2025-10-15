import { redirect } from 'next/navigation';

import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaEnrollment } from '@/components/login/MfaEnrollment';
import { getFeatureFlags } from '@/services/feature-flags';
import { CompanyName } from '@/types/carriers';
import { getCookie } from '@/utils/auth';
import { isVercelEnvironment } from '@/utils/environment';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

import { GenericLoginPage } from '../../GenericLoginPage';

export default async function MfaEnrollmentPage() {
  const featureFlagDecisions = await getFeatureFlags();
  const themeCookie = (await getCookie(THEME_COOKIE)) as CompanyName;

  if (!themeCookie && !isVercelEnvironment()) {
    redirect('/');
  }

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    return (
      <GenericInfoPage
        title="Let’s secure your account."
        description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
        action={<MfaEnrollment />}
      />
    );
  }

  return (
    <GenericLoginPage
      title="Let’s secure your account."
      description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
      action={<MfaEnrollment />}
    />
  );
}
