import { getSession } from '@/utils/auth';
import { getFeatureFlagDecisions } from '@/utils/optimizely/optimizely';

export const getFeatureFlags = async () => {
  const session = await getSession();
  const userId = session?.user?.sub;
  const featureFlagDecisions = await getFeatureFlagDecisions(userId);
  return featureFlagDecisions;
};
