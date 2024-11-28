import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { EnterEmailStep } from '@/components/login/EnterEmailStep';
import { getFeatureFlags } from '@/services/feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { GenericLoginPage } from './GenericLoginPage';

export default async function LoginPage() {
  const featureFlagDecisions = await getFeatureFlags();

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
