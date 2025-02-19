import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaChallengeOld } from '@/components/login/MfaChallengeOld';
import { getFeatureFlags } from '@/services/feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { MfaChallengeLogin } from './MfaChallengeLogin';
import { GenericLoginPage } from '../../GenericLoginPage';

export default async function MfaChallengePage({
  searchParams,
}: {
  searchParams: { enrollment?: string; id?: string };
}) {
  const featureFlagDecisions = await getFeatureFlags();

  if (!featureFlagDecisions[FEATURE_FLAGS.TRANSACTION_LEVEL_CODE_ADD_BANK]) {
    return (
      <GenericInfoPage
        title="Enter your code."
        description="Enter your 6-digit verification code."
        action={
          <MfaChallengeOld
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
        <MfaChallengeLogin
          enrollment={searchParams.enrollment}
          id={searchParams.id}
        />
      }
    />
  );
}
