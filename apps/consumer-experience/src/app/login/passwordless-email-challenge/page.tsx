import { PasswordlessEmailChallenge } from '@/components/login/PasswordlessEmailChallenge';
import { GenericLoginPage } from '../GenericLoginPage';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { getFeatureFlags } from '@/services/feature-flags';

export default async function PasswordlessEmailChallengePage({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  const featureFlagDecisions = await getFeatureFlags();

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    return (
      <GenericInfoPage
        title="Enter your code."
        description="Check for an email from us with your 6-digit verification code."
        action={<PasswordlessEmailChallenge email={searchParams.email} />}
      />
    );
  }

  return (
    <GenericLoginPage
      title="Enter your code."
      description="Check for an email from us with your 6-digit verification code."
      action={<PasswordlessEmailChallenge email={searchParams.email} />}
    />
  );
}
