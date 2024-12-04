import { ProcessType } from '@deps/models/case/enums';
import { TaskType } from '@deps/models/case/task';

import { FEATURE_FLAGS, FeatureKeyIdentifier } from './flags';
import { FeatureFlags } from './optimizely';

export const isFormFeatureEnabled = (processType: ProcessType | TaskType, clientId: string, featureFlagMap: FeatureFlags): boolean => {
    const identifier = `${processType.toUpperCase()}_${clientId.toUpperCase()}` as FeatureKeyIdentifier;
    const featureKey = FEATURE_FLAGS[identifier];
    return featureKey && featureFlagMap[featureKey] ? featureFlagMap[featureKey] : false;
};
