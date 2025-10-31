import {
  Client,
  createInstance,
  OptimizelyDecideOption,
  OptimizelyDecision,
} from '@optimizely/optimizely-sdk';

import { logError } from '@/utils/logging/log-fns';

import { FEATURE_FLAGS } from './flags';
import { getThemeCookies } from '../theme';

export type FeatureFlags =
  | Record<FEATURE_FLAGS, boolean>
  | Record<string, never>;

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
        throw new Error(
          `optimizely.ts::ensureOnReady:: instance onReady failed:: ${reason}`
        );
      }
      this.onReadyCalled = true;
    }
  }

  public async getFeatureFlagDecisions(userId: string): Promise<FeatureFlags> {
    try {
      if (!this.optimizelyClient) {
        throw new Error(
          'optimizely.ts::getFeatureFlagDecisions:: instance creation failed'
        );
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

      // We need to get the theme to compare to the variables that come in with the optimizely feature flags
      const theme = await getThemeCookies();

      return Object.keys(decisionResults).reduce((acc, curr) => {
        const currentObject = decisionResults?.[curr];

        // First we check to see if there are variables in this flag
        const themeIsInVariables = checkForThemeVariables(currentObject, theme);

        // If there are variables that match our current theme, we make sure we use them.
        if (themeIsInVariables) {
          return {
            ...acc,
            [curr]: theme && currentObject?.variables?.[theme],
          };
        }

        // Otherwise we just return the enabled value
        return {
          ...acc,
          [curr]: decisionResults?.[curr]?.enabled,
        };
      }, {});
    } catch (e) {
      logError(
        'getFeatureFlagDecisions::Error initializing Optimizely instance',
        {
          file: 'optimizely',
          function: 'getFeatureFlagDecisions',
          e,
        }
      );
      return {};
    }
  }
}

// Exporting a single instance of the class
export const optimizelyService = new OptimizelyService(
  process.env.OPTIMIZELY_SDK_KEY ?? ''
);

const checkForThemeVariables = (
  optimizelyFlag: OptimizelyDecision | undefined,
  theme: string | undefined
) => {
  const hasVariables =
    optimizelyFlag && Object.keys(optimizelyFlag?.variables).length > 0;

  const themeIsInVariables =
    hasVariables &&
    Object.keys(optimizelyFlag?.variables).some(key => key === theme);

  return !!themeIsInVariables;
};
