import { renderHook } from '@testing-library/react';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';

import useCaseInsightsPermission from './useCaseInsights';

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: jest.fn(),
}));

jest.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: jest.fn(),
}));

jest.mock('@deps/utils/optimizely/flags', () => ({
    FEATURE_FLAGS: {
        CASE_INSIGHTS: 'case_insights',
    },
}));

describe('useCaseInsightsPermission', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockUseOptimizely = useOptimizely as jest.Mock;
    const mockUsePermissionsContext = usePermissionsContext as jest.Mock;

    it('returns true when feature flag and permission are both true', () => {
        mockUseOptimizely.mockReturnValue({
            featureFlags: {
                case_insights: true,
            },
        });

        mockUsePermissionsContext.mockReturnValue({
            hasCaseInsightPermission: true,
        });

        const { result } = renderHook(() => useCaseInsightsPermission());
        expect(result.current).toBe(true);
    });

    it('returns false when feature flag is false', () => {
        mockUseOptimizely.mockReturnValue({
            featureFlags: {
                case_insights: false,
            },
        });

        mockUsePermissionsContext.mockReturnValue({
            hasCaseInsightPermission: true,
        });

        const { result } = renderHook(() => useCaseInsightsPermission());
        expect(result.current).toBe(false);
    });

    it('returns false when permission is false', () => {
        mockUseOptimizely.mockReturnValue({
            featureFlags: {
                case_insights: true,
            },
        });

        mockUsePermissionsContext.mockReturnValue({
            hasCaseInsightPermission: false,
        });

        const { result } = renderHook(() => useCaseInsightsPermission());
        expect(result.current).toBe(false);
    });

    it('returns false when featureFlags is undefined', () => {
        mockUseOptimizely.mockReturnValue({
            featureFlags: undefined,
        });

        mockUsePermissionsContext.mockReturnValue({
            hasCaseInsightPermission: true,
        });

        const { result } = renderHook(() => useCaseInsightsPermission());
        expect(result.current).toBe(undefined); // because undefined && true === undefined
    });
});
