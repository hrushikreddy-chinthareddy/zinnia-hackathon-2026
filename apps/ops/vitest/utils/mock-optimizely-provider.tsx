import { ReactNode } from 'react';

import {
    OptimizelyData,
    OptimizelyDataContext,
} from '@deps/contexts/OptimizelyContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

interface MockOptimizelyProviderProps {
    children: ReactNode;
    featureFlags?: Partial<Record<FEATURE_FLAGS, boolean>>;
    featureFlagVariables?: OptimizelyData['featureFlagVariables'];
    areFlagsLoading?: boolean;
}

/**
 * Mock provider for testing components that use OptimizelyContext.
 *
 * @example
 * ```tsx
 * import { MockOptimizelyProvider } from '../vitest/utils/mock-optimizely-provider';
 * import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
 *
 * render(
 *   <MockOptimizelyProvider
 *     featureFlags={{
 *       [FEATURE_FLAGS.CASE_STATS_COUNT]: true,
 *       [FEATURE_FLAGS.ENABLE_NEW_FEATURE]: false,
 *     }}
 *   >
 *     <YourComponent />
 *   </MockOptimizelyProvider>
 * );
 * ```
 */
export const MockOptimizelyProvider = ({
    children,
    featureFlags = {},
    featureFlagVariables = {},
    areFlagsLoading = false,
}: MockOptimizelyProviderProps) => {
    return (
        <OptimizelyDataContext.Provider
            value={{
                featureFlags: featureFlags as Record<FEATURE_FLAGS, boolean>,
                featureFlagVariables,
                areFlagsLoading,
            }}
        >
            {children}
        </OptimizelyDataContext.Provider>
    );
};

/**
 * Mock hook for testing. Use this with vi.mock() to replace useOptimizely.
 *
 * @example
 * ```tsx
 * vi.mock('@deps/contexts/OptimizelyContext', () => ({
 *   useOptimizely: () => createMockOptimizelyData({
 *     featureFlags: {
 *       [FEATURE_FLAGS.CASE_STATS_COUNT]: true,
 *     },
 *   }),
 * }));
 * ```
 */
export const createMockOptimizelyData = (
    overrides: Partial<OptimizelyData> = {}
): OptimizelyData => ({
    featureFlags: {},
    featureFlagVariables: {},
    areFlagsLoading: false,
    ...overrides,
});
