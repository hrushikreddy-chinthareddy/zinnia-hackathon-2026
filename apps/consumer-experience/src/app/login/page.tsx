import { redirect } from 'next/navigation';

import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { EnterEmailStep } from '@/components/login/EnterEmailStep';
import { getFeatureFlags } from '@/services/feature-flags';
import { CompanyName } from '@/types/carriers';
import { getCookie } from '@/utils/auth';
import { isVercelEnvironment } from '@/utils/environment';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

import { GenericLoginPage } from './GenericLoginPage';

export default async function LoginPage() {
  const featureFlagDecisions = await getFeatureFlags();
  const themeCookie = (await getCookie(THEME_COOKIE)) as CompanyName;

  if (!themeCookie && !isVercelEnvironment()) {
    redirect('/');
  }

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    return (
      <GenericInfoPage
        title="What’s your email?"
        description="Enter the email associated with your policy or contract, and we'll send you a verification code."
        action={<EnterEmailStep />}
      />
    );
  }

  return (
    <GenericLoginPage
      title="What’s your email?"
      description="Enter the email associated with your policy or contract, and we'll send you a verification code."
      action={<EnterEmailStep />}
    />
  );
}
