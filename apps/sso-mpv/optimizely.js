import { createInstance } from '@optimizely/optimizely-sdk';
import logger from './logging/logger.js';

let optimizelyClient = null;
let onReadyCalled = false;

export const initOptimizely = () => {
  if (!process.env.OPTIMIZELY_SDK_KEY) {
    logger.info('Optimizely SDK key not found, skipping initialization');
    optimizelyClient = null;
    return;
  }

  optimizelyClient = createInstance({
    sdkKey: process.env.OPTIMIZELY_SDK_KEY,
  });
};

const ensureOnReady = async () => {
  if (!onReadyCalled && optimizelyClient) {
    const { success, reason } = await optimizelyClient.onReady();
    if (!success) {
      throw new Error(`Optimizely onReady failed: ${reason}`);
    }
    onReadyCalled = true;
  }
};

export const isFeatureEnabled = async (flagKey) => {
  if (!optimizelyClient) {
    return false;
  }

  await ensureOnReady();

  const userId = 'userId-ssoMpv';
  const user = optimizelyClient.createUserContext(userId);

  if (!user) {
    throw new Error('Failed to create Optimizely user context');
  }

  const decision = user.decide(flagKey);
  return decision.enabled;
};

export const FEATURE_FLAGS = {
  LOGIN_AUTH0_UNIVERSAL_LOGIN: 'login_auth0_universal_login',
};
