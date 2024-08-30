import { getSession } from '@/utils/auth';
import { optimizelyService } from '@/utils/optimizely/optimizely';

export const getFeatureFlags = async () => {
  const session = await getSession();
  const userId = session?.user?.sub;
  const featureFlagDecisions = await optimizelyService.getFeatureFlagDecisions(
    userId || ''
  );
  return featureFlagDecisions;
};
