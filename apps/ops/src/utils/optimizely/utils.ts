import { ProcessType } from '@deps/models/case/enums';
import { TaskToProcessType, TaskType } from '@deps/models/case/task';
import { SorSystem } from '@deps/models/policy/enums';

import { FEATURE_FLAGS, FeatureKeyIdentifier } from './flags';
import { FeatureFlags, FeatureFlagVariableType } from './types';

export const isFormFeatureEnabled = (
    processType: ProcessType | TaskType,
    clientId: string,
    featureFlagMap: FeatureFlags
): boolean => {
    const identifier =
        `${processType.toUpperCase()}_${clientId.toUpperCase()}` as FeatureKeyIdentifier;
    const featureKey = FEATURE_FLAGS[identifier];
    return featureKey && featureFlagMap[featureKey]
        ? featureFlagMap[featureKey]
        : false;
};

export const isFastFeatureEnabled = (
    taskType: string,
    featureFlagMap: FeatureFlags | undefined
): boolean => {
    if (!featureFlagMap) {
        return false;
    }
    const type =
        TaskToProcessType[
            taskType.toUpperCase() as keyof typeof TaskToProcessType
        ];
    const identifier = `FAST_${type}` as FeatureKeyIdentifier;
    const featureKey = FEATURE_FLAGS[identifier];
    return featureKey && featureFlagMap[featureKey]
        ? featureFlagMap[featureKey]
        : false;
};

export const isSourceSystemLifeCad = (sourceSystem: string): boolean => {
    return sourceSystem === SorSystem.LifeCad.toLowerCase() ? true : false;
};

export const isFeatureFlagVariableActive = (
    featureFlagVariables: FeatureFlagVariableType,
    featureFlag: string,
    key: string,
    value: string
): boolean => {
    return (
        featureFlagVariables?.[featureFlag]?.variables?.[key]?.[value] ?? false
    );
};
