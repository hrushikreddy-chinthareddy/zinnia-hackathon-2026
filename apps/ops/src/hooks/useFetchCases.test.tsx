import { renderHook, act } from '@testing-library/react';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { getCases } from '@deps/queries/api/cases';

import { useFetchCases } from './useFetchCases';

jest.mock('@deps/queries/api/cases');
jest.mock('@deps/contexts/OptimizelyContext');

const mockGetCases = getCases as jest.Mock;

const mockFeatureFlags = { someFlag: true };

beforeEach(() => {
    jest.clearAllMocks();
    (useOptimizely as jest.Mock).mockReturnValue({
        featureFlags: mockFeatureFlags,
    });
});

describe('useFetchCases', () => {
    it('initializes with expected default values', () => {
        const { result } = renderHook(() => useFetchCases());

        expect(result.current.cases).toBeNull();
        expect(result.current.total).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.filters).toEqual({});
    });

    it('sets cases and total when fetch succeeds', async () => {
        const mockCases = [{ id: 'case1' }, { id: 'case2' }];
        mockGetCases.mockResolvedValue({ total: 2, data: mockCases });

        const { result } = renderHook(() => useFetchCases());

        act(() => {
            result.current.setFilters({ sortBy: 'anything' });
        });

        await act(async () => {
            await result.current.fetchCases();
        });

        expect(mockGetCases).toHaveBeenCalledWith(
            { sortBy: 'anything' },
            mockFeatureFlags
        );
        expect(result.current.cases).toEqual(mockCases);
        expect(result.current.total).toBe(2);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('sets error state if fetch fails', async () => {
        mockGetCases.mockRejectedValue(new Error('Network Error'));

        const { result } = renderHook(() => useFetchCases());

        act(() => {
            result.current.setFilters({ sortBy: 'error' });
        });

        await act(async () => {
            await result.current.fetchCases();
        });

        expect(result.current.cases).toBeNull();
        expect(result.current.total).toBeNull();
        expect(result.current.error).toBe('Network Error');
        expect(result.current.loading).toBe(false);
    });

    it('clears cases and total when filters become empty', () => {
        const { result } = renderHook(() => useFetchCases());

        act(() => {
            result.current.setFilters({ sortBy: 'anything' });
        });

        act(() => {
            result.current.setFilters({});
        });

        expect(result.current.cases).toBeNull();
        expect(result.current.total).toBeNull();
    });
});
