import { buildCommonLogContext } from '@/utils/logging/server-logging';

import { getCarrierConfig } from './carrier-config';
import { getFeatureFlags } from './feature-flags';

export const getFeatureFlagsWithCarrierConfig = async () => {
  const loggingContext = await buildCommonLogContext();
  const [featureFlagsResult, carrierConfigResult] = await Promise.allSettled([
    getFeatureFlags(),
    getCarrierConfig(loggingContext),
  ]);

  if (featureFlagsResult.status === 'rejected') {
    console.error('Failed to fetch feature flags:', featureFlagsResult.reason);
  }

  if (carrierConfigResult.status === 'rejected') {
    console.error(
      'Failed to fetch carrier config:',
      carrierConfigResult.reason
    );
  }

  return {
    featureFlags:
      featureFlagsResult.status === 'fulfilled'
        ? featureFlagsResult.value
        : null,
    carrierConfig:
      carrierConfigResult.status === 'fulfilled'
        ? carrierConfigResult.value.data
        : null,
  };
};
