import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { getBreadcrumbText } from '@deps/helpers/routing.helpers';
import { storage } from '@deps/helpers/sessionStorage.helpers';

import useBreadcrumb from './useBreadcrumbs';

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('@deps/helpers/routing.helpers', () => ({
    getBreadcrumbText: jest.fn(),
}));

jest.mock('@deps/helpers/sessionStorage.helpers', () => ({
    storage: {
        getItem: jest.fn(),
    },
}));

describe('useBreadcrumb', () => {
    const mockOn = jest.fn();
    const mockOff = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();

        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => key,
        });

        (useRouter as jest.Mock).mockReturnValue({
            events: {
                on: mockOn,
                off: mockOff,
            },
        });

        jest.clearAllMocks();
    });

    it('sets breadcrumb and currentPath from session storage', () => {
        const mockPrev = { url: '/prev', h1: 'Previous Page' };
        const mockCurrent = { url: '/current' };
        const mockPathHistory = [mockPrev];

        (storage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'current') return mockCurrent;
            if (key === 'pathHistory') return mockPathHistory;
            return null;
        });

        (getBreadcrumbText as jest.Mock).mockReturnValue('Translated Text');

        const { result } = renderHook(() => useBreadcrumb());

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current.currentPath).toBe('/current');
        expect(result.current.breadcrumb).toEqual({
            url: '/prev',
            h1: 'Previous Page',
            text: 'Translated Text',
        });

        expect(mockOn).toHaveBeenCalledWith(
            'routeChangeComplete',
            expect.any(Function)
        );
    });

    it('cleans up router event listener on unmount', () => {
        const { unmount } = renderHook(() => useBreadcrumb());

        unmount();

        expect(mockOff).toHaveBeenCalledWith(
            'routeChangeComplete',
            expect.any(Function)
        );
    });

    it('handles empty history gracefully', () => {
        (storage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'current') return { url: '/current' };
            if (key === 'pathHistory') return [];
            return null;
        });

        const { result } = renderHook(() => useBreadcrumb());

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current.breadcrumb).toBeNull();
        expect(result.current.currentPath).toBe('/current');
    });

    it('handles null values from storage gracefully', () => {
        (storage.getItem as jest.Mock).mockImplementation(() => null);

        const { result } = renderHook(() => useBreadcrumb());

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current.breadcrumb).toBeNull();
        expect(result.current.currentPath).toBeNull();
    });

    it('handles non-object current value from storage', () => {
        (storage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'current') return 'not-an-object';
            if (key === 'pathHistory') return [{ url: '/prev', h1: 'Prev' }];
            return null;
        });

        (getBreadcrumbText as jest.Mock).mockReturnValue('Prev Text');

        const { result } = renderHook(() => useBreadcrumb());

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current.currentPath).toBeNull();
        expect(result.current.breadcrumb).toEqual({
            url: '/prev',
            h1: 'Prev',
            text: 'Prev Text',
        });
    });

    it('handles non-array pathHistory value from storage', () => {
        (storage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'current') return { url: '/current' };
            if (key === 'pathHistory') return 'not-an-array'; // string is indexable
            return null;
        });

        (getBreadcrumbText as jest.Mock).mockReturnValue('Prev Text');

        const { result } = renderHook(() => useBreadcrumb());

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current.breadcrumb).toEqual({
            url: undefined,
            h1: undefined,
            text: 'Prev Text',
        });

        expect(result.current.currentPath).toBe('/current');
    });

    it('handles malformed pathHistory entry with missing url/h1', () => {
        (storage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'current') return { url: '/current' };
            if (key === 'pathHistory') return [{}]; // no url, no h1
            return null;
        });

        (getBreadcrumbText as jest.Mock).mockReturnValue('undefined');

        const { result } = renderHook(() => useBreadcrumb());

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current.breadcrumb).toEqual({
            url: undefined,
            h1: undefined,
            text: 'undefined',
        });

        expect(result.current.currentPath).toBe('/current');
    });
});
