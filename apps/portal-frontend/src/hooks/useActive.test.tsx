import { renderHook } from '@testing-library/react';

import { SubLink } from '@deps/config/nav.config';

import { useActive } from './useActive';

jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '/path',
            query: '',
            asPath: '/path',
        };
    },
}));

describe('Use Active Hook', () => {
    it('should be inactive', () => {
        const { result } = renderHook(() => useActive({} as SubLink));

        expect(result.current).toBe(false);
    });

    it('should be active with valid href', () => {
        const href = '/path';
        const { result } = renderHook(() => useActive({ href } as SubLink));

        expect(result.current).toBe(true);
    });

    it('should be inactive with inactive href', () => {
        const href = '/policies';
        const { result } = renderHook(() => useActive({ href } as SubLink));

        expect(result.current).toBe(false);
    });

    it('should be active with valid sublinks', () => {
        const href = '/';
        const subLinks = [{ href: '/path', text: 'subLink' }];
        const { result } = renderHook(() => useActive({ href, subLinks } as SubLink));

        expect(result.current).toBe(true);
    });
});
