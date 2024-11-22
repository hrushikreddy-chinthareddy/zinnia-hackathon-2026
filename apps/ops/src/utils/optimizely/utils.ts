import { ProcessType } from '@deps/models/case/enums';

import { FEATURE_FLAGS, FeatureKeyIdentifier } from './flags';
import { FeatureFlags } from './optimizely';

export const isFormFeatureEnabled = (processType: ProcessType, clientId: string, featureFlagMap: FeatureFlags): boolean => {
    const identifier = `${processType}_${clientId.toUpperCase()}` as FeatureKeyIdentifier;
    const featureKey = FEATURE_FLAGS[identifier];
    return featureKey && featureFlagMap[featureKey] ? featureFlagMap[featureKey] : false;
};
