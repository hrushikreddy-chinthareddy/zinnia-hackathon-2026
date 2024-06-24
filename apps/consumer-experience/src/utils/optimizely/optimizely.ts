import {
  OptimizelyDecideOption,
  createInstance,
} from '@optimizely/optimizely-sdk';

import { logError } from '@/utils/logging/server-logging';

export const getFeatureFlagDecisions = async (
  userId?: string
  // TODO: fix return type
) => {
  if (!userId) {
    throw new Error(
      'optimizely.ts::getFeatureFlagDecisions:: instance creation failed'
    );
  }

  try {
    const DATAFILE_URL = `https://cdn.optimizely.com/datafiles/${process.env.OPTIMIZELY_SDK_KEY}.json`;

    const response = await fetch(DATAFILE_URL);
    const datafile = await response.json();

    const optimizely = createInstance({
      datafile,
    });

    if (!optimizely) {
      throw new Error(
        'optimizely.ts::getFeatureFlagDecisions:: instance creation failed'
      );
    }
    const user = optimizely.createUserContext(userId);

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
};
