import {
  OptimizelyDecideOption,
  createInstance,
} from '@optimizely/optimizely-sdk';

import { logError } from '@/utils/logging/server-logging';

import { FEATURE_FLAGS } from './flags';

export type EnabledFeatureFlags = {
  [key in FEATURE_FLAGS]: boolean;
};

// TODO: This works for now. the call to optimizely is being cached because it is a fetch GET
// request, however, i think this could be called once and stored in the session maybe? or use
// something like this https://github.com/manvalls/server-only-context to store
// the flags. It seems like the intent of retrieving the datafile is to prevent having to make
// multiple calls to optimizely, but I'm still unclear how the userContext works, if it makes another
// call or some amount of user data is returned in the datafile

// Similarly, in the future, we may want to implement a User Profile Service to
// persist user data for experimentation https://docs.developers.optimizely.com/feature-experimentation/docs/implement-a-user-profile-service-javascript
// to create a consistent experience if we are going to do A/B testing or percentage based features
export const getFeatureFlagDecisions = async (
  userId?: string
): Promise<EnabledFeatureFlags> => {
  if (!userId) {
    throw new Error(
      'optimizely.ts::getFeatureFlagDecisions:: instance creation failed'
    );
  }

  try {
    const DATAFILE_URL = `https://cdn.optimizely.com/datafiles/${process.env.OPTIMIZELY_SDK_KEY}.json`;

    // This is fetched using next cache...how long does that cache persist?
    const response = await fetch(DATAFILE_URL);
    const datafile = await response.json();

    // Cann initialize with both datafile and sdkKey so that optimizely will continue to poll
    // for updates in the background, but begin with the datafile
    // https://docs.developers.optimizely.com/feature-experimentation/docs/initialize-sdk-javascript#examples
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
    ]);

    return Object.keys(decisionResults).reduce((acc, curr) => {
      return {
        ...acc,
        [curr]: decisionResults?.[curr]?.enabled,
      };
    }, {} as EnabledFeatureFlags);
  } catch (e) {
    logError(
      'getFeatureFlagDecisions::Error initializing Optimizely instance',
      {
        file: 'optimizely',
        function: 'getFeatureFlagDecisions',
        e,
      }
    );
    return {} as EnabledFeatureFlags;
  }
};
