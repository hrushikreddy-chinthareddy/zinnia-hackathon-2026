import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { PasswordlessEmailChallenge } from '@/components/login/PasswordlessEmailChallenge';
import { getFeatureFlags } from '@/services/feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { GenericLoginPage } from '../GenericLoginPage';

export default async function PasswordlessEmailChallengePage() {
  const featureFlagDecisions = await getFeatureFlags();

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
