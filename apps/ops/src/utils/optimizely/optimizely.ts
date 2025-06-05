import { Client, createInstance, OptimizelyDecideOption, OptimizelyDecision } from '@optimizely/optimizely-sdk';

import { ENVIRONMENT_NAME, isQA, isUat } from '../environment.helpers';
import { logError, LoggingContext, parseErrorInformation } from '../server-logging';
import { FEATURE_FLAGS } from './flags';

export type FeatureFlags = Record<FEATURE_FLAGS, boolean> | Record<string, never>;

export type FeatureFlagVariableType = {
    [key: string]: OptimizelyDecision & {
        variables: {
            [variableKey: string]: {
                [value: string]: boolean;
            };
        };
    };
};

const getVeriableByEnviroment = (variableName: string): string => {
    const envSuffix = isQA() ? `-${ENVIRONMENT_NAME.QA}` : isUat() ? `-${ENVIRONMENT_NAME.UAT}` : '';
    return variableName + envSuffix;
};

export const isFeatureFlagVariableActive = (
    featureFlagVariables: FeatureFlagVariableType,
    featureFlag: string,
    key: string,
    value: string
): boolean => {
    const flagVariableWithEnv = getVeriableByEnviroment(key);
    return featureFlagVariables?.[featureFlag]?.variables?.[flagVariableWithEnv]?.[value] ?? false;
};

export const getFeatureFlagByKey = async (
    featureFlag: string,
    variableKey: string,
    variableValue: string,
    userId: string,
    loggingContext: LoggingContext
) => {
    const flagVariableWithEnv = getVeriableByEnviroment(variableKey);
    const featureFlagVariables = await optimizelyService.getFeatureFlagVariables(featureFlag, flagVariableWithEnv, userId, loggingContext);
    return featureFlagVariables?.[variableValue] ?? false;
};
export class OptimizelyService {
    private optimizelyClient: Client | null = null;
    private onReadyCalled: boolean = false;

    constructor(sdkKey: string, optimizelyClient?: Client | null) {
        if (optimizelyClient !== undefined) {
            this.optimizelyClient = optimizelyClient;
        } else {
            this.optimizelyClient = createInstance({
                sdkKey,
            });
        }
    }

    private async ensureOnReady(): Promise<void> {
        if (!this.onReadyCalled && this.optimizelyClient) {
            const { success, reason } = await this.optimizelyClient.onReady();
            if (!success) {
                throw new Error(`optimizely.ts::ensureOnReady:: instance onReady failed:: ${reason}`);
            }
            this.onReadyCalled = true;
        }
    }

    public async getFeatureFlagDecisions(userId: string, loggingContext: LoggingContext): Promise<FeatureFlags> {
        try {
            if (!this.optimizelyClient) {
                throw new Error('optimizely.ts::getFeatureFlagDecisions:: instance creation failed');
            }

            await this.ensureOnReady();

            const attributes = { userId: userId };
            const user = this.optimizelyClient.createUserContext(userId, attributes);

            if (!user) {
                throw new Error('failed to create user context');
            }

            const decisionResults = user.decideAll([
                OptimizelyDecideOption.ENABLED_FLAGS_ONLY,
                OptimizelyDecideOption.IGNORE_USER_PROFILE_SERVICE,
            ]);

            return Object.keys(decisionResults).reduce((acc, curr) => {
                return {
                    ...acc,
                    [curr]: decisionResults[curr].enabled,
                };
            }, {});
        } catch (e) {
            logError('getFeatureFlagDecisions::Error initializing Optimizely instance', {
                ...loggingContext,
                file: 'utils/optimizely/optimizely',
                function: 'getFeatureFlagDecisions',
                ...parseErrorInformation(e),
            });
            return {};
        }
    }

    public async getFeatureFlagVariables(
        featureKey: string,
        variableName: string,
        userId: string,
        loggingContext: LoggingContext
    ): Promise<Record<string, unknown>> {
        try {
            if (!this.optimizelyClient) {
                throw new Error('optimizely.ts::getFeatureFlagDecisions:: instance creation failed');
            }

            await this.ensureOnReady();
            const isFeatureEnabled = this.optimizelyClient.isFeatureEnabled(featureKey, userId);

            if (!isFeatureEnabled) {
                logError('getFeatureFlagVariable::Feature is not enabled', {
                    ...loggingContext,
                    file: 'utils/optimizely/optimizely',
                    function: 'getFeatureFlagVariables',
                    featureKey,
                    userId,
                });
                return {} as Record<string, unknown>;
            }

            const attributes = { userId: userId };
            return this.optimizelyClient.getFeatureVariableJSON(featureKey, variableName, userId, attributes) as Record<string, unknown>;
        } catch (e) {
            logError('getFeatureFlagVariable::Error initializing Optimizely instance', {
                ...loggingContext,
                file: 'utils/optimizely/optimizely',
                function: 'getFeatureFlagVariables',
                ...parseErrorInformation(e),
            });
            return {} as Record<string, unknown>;
        }
    }

    public async getAllFeatureFlagVariables(userId: string, loggingContext: LoggingContext): Promise<FeatureFlagVariableType> {
        try {
            if (!this.optimizelyClient) {
                throw new Error('optimizely.ts::getAllFeatureFlagVariables:: instance creation failed');
            }

            await this.ensureOnReady();

            const attributes = { userId: userId };
            const user = this.optimizelyClient.createUserContext(userId, attributes);

            if (!user) {
                throw new Error('failed to create user context');
            }

            const decisionResults = user.decideAll([
                OptimizelyDecideOption.ENABLED_FLAGS_ONLY,
                OptimizelyDecideOption.IGNORE_USER_PROFILE_SERVICE,
            ]);

            return Object.keys(decisionResults).reduce((acc, curr) => {
                if (Object.keys(decisionResults[curr].variables).length > 0) {
                    return {
                        ...acc,
                        [curr]: { enabled: decisionResults[curr].enabled, variables: decisionResults[curr].variables },
                    };
                }
                return acc;
            }, {});
        } catch (e) {
            logError('getAllFeatureFlagVariables::Error initializing Optimizely instance', {
                ...loggingContext,
                file: 'utils/optimizely/optimizely',
                function: 'getAllFeatureFlagVariables',
                ...parseErrorInformation(e),
            });
            return {};
        }
    }
}

// Exporting a single instance of the class
export const optimizelyService = new OptimizelyService(process.env.OPTIMIZELY_SDK_KEY ?? '');
