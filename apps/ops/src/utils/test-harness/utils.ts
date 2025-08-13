import { isDemo } from '../environment.helpers';

/**
 *
 * Display test harness only if super admin and running locally or in the demo instance
 */
export const allowTestHarness = (hasTestHarnessAccess: boolean) => {
    return hasTestHarnessAccess && isDemo();
};
