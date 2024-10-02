import { useEffect, useState } from 'react';

import { FeatureFlags } from '@/utils/optimizely/optimizely';

/**
 * A hook to get feature flags from optimizely.
 *
 * Currently a custom call, but we should replace this method with tanstack if we implement it.
 * TODO: Replace with the tanstack implementation
 * @returns Feature Flags object
 */
export const useFeatureFlags = () => {
  const [data, setData] = useState<FeatureFlags>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    const getFlags = async () => {
      try {
        setLoading(true);
        const featureFlagDecisions = await fetch('/api/feature-flags');

        const { featureFlags } = await featureFlagDecisions.json();

        setData(featureFlags);
        setLoading(false);
        setError('');
      } catch (e) {
        setError(e);
      }
    };

    getFlags();
  }, []);

  return { data, loading, error };
};
