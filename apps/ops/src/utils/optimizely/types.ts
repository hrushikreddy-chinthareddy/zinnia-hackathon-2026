import { OptimizelyDecision } from '@optimizely/optimizely-sdk';

import { FEATURE_FLAGS } from './flags';

export type FeatureFlags =
    | Record<FEATURE_FLAGS, boolean>
    | Record<string, never>;

export type FeatureFlagVariableType = {
    [key: string]: OptimizelyDecision & {
        variables: {
            [variableKey: string]: {
                [value: string]: boolean;
            };
        };
    };
};
