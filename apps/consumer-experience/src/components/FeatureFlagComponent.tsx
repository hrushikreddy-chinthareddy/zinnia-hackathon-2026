'use client';

import { Loader } from '@zinnia/bloom/components';
import { FC } from 'react';

import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

interface FeatureFlagComponentProps {
  flagKey: FEATURE_FLAGS;
  enabledComponent: React.ReactNode;
  disabledComponent?: React.ReactNode | null;
  showLoadingIndicator?: boolean;
}

export const FeatureFlagComponent: FC<FeatureFlagComponentProps> = ({
  flagKey,
  enabledComponent,
  disabledComponent = null,
  showLoadingIndicator = false,
}) => {
  const { data: featureFlagData, loading } = useFeatureFlags();

  if (loading) {
    if (showLoadingIndicator) {
      <Loader />;
    }
    return null;
  }

  if (featureFlagData && Object.hasOwn(featureFlagData, flagKey)) {
    return enabledComponent;
  }
  return disabledComponent;
};
