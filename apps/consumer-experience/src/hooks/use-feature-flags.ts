import { useQuery } from '@tanstack/react-query';

import { getFeatureFlags } from '@/queries/feature-flag-queries';
import { QueryKeys } from '@/queries/query-keys';

/**
 * A hook to get feature flags from optimizely.
 *
 * @returns Feature Flags object
 */
export const useFeatureFlags = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: [QueryKeys.FEATURE_FLAGS],
    queryFn: () => getFeatureFlags(),
    staleTime: 15 * 60 * 1000,
  });

  return { data, loading: isLoading, error };
};
