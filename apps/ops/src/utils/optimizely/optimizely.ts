import { Client, createInstance, OptimizelyDecideOption } from '@optimizely/optimizely-sdk';

import { FEATURE_FLAGS } from './flags';
import { logError, parseErrorInformation } from '../server-logging';

export type FeatureFlags = Record<FEATURE_FLAGS, boolean> | Record<string, never>;

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

    public async getFeatureFlagDecisions(userId: string): Promise<FeatureFlags> {
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
                file: 'optimizely',
                function: 'getFeatureFlagDecisions',
                ...parseErrorInformation(e),
            });
            return {};
        }
    }

    public async getFeatureFlagVariables(featureKey: string, variableName: string, userId: string): Promise<Record<string, unknown>> {
        try {
            if (!this.optimizelyClient) {
                throw new Error('optimizely.ts::getFeatureFlagDecisions:: instance creation failed');
            }

            await this.ensureOnReady();

            const attributes = { userId: userId };
            return this.optimizelyClient.getFeatureVariableJSON(featureKey, variableName, userId, attributes) as Record<string, unknown>;
        } catch (e) {
            logError('getFeatureFlagVariable::Error initializing Optimizely instance', {
                file: 'optimizely',
                function: 'getFeatureFlagVariable',
                ...parseErrorInformation(e),
            });
            return {} as Record<string, unknown>;
        }
    }
}

// Exporting a single instance of the class
export const optimizelyService = new OptimizelyService(process.env.OPTIMIZELY_SDK_KEY ?? '');
