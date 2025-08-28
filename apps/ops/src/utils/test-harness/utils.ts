import { isDemo, isProd } from '../environment.helpers';

/**
 *
 * Display test harness only if super admin and running locally or in the demo instance
 */
export const allowTestHarness = (hasTestHarnessAccess: boolean) => {
    return hasTestHarnessAccess && isDemo() && !isProd(); //THIS IS NEVER ALLOWED IN PROD
};
