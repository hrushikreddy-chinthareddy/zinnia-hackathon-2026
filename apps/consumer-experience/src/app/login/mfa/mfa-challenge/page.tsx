import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaChallenge as MfaChallengeOld } from '@/components/login/MfaChallenge';
import { MfaChallenge } from '@/components/mfa/mfa-challenge/MfaChallenge';
import { getFeatureFlags } from '@/services/feature-flags';
import { ROOT_URL_PATH } from '@/types';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { FROM_LOGIN_QUERY_KEY } from '@/utils/serverClientUtils';

import { handleRedirection } from './redirect';
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
        <MfaChallenge
          enrollment={searchParams.enrollment}
          id={searchParams.id}
          onChallengeSuccess={() =>
            handleRedirection(`/${ROOT_URL_PATH}?${FROM_LOGIN_QUERY_KEY}=true`)
          }
          onChallengeFailure={() => handleRedirection(`/login/error`)}
        />
      }
    />
  );
}
