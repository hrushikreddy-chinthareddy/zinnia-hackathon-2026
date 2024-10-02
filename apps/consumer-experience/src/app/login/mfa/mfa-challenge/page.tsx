import { MfaChallenge } from '@/components/login/MfaChallenge';
import { GenericLoginPage } from '../../GenericLoginPage';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { getFeatureFlags } from '@/services/feature-flags';

export default async function MfaChallengePage({
  searchParams,
}: {
  searchParams: { enrollment?: string; id?: string };
}) {
  const featureFlagDecisions = await getFeatureFlags();

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    return (
      <GenericInfoPage
        title="Enter your code."
        description="Enter your 6-digit verification code."
        action={
          <MfaChallenge
            enrollment={searchParams.enrollment}
            id={searchParams.id}
          />
        }
      />
    );
  }

  return (
    <GenericLoginPage
      title="Enter your code."
      description="Enter your 6-digit verification code."
      action={
        <MfaChallenge
          enrollment={searchParams.enrollment}
          id={searchParams.id}
        />
      }
    />
  );
}
