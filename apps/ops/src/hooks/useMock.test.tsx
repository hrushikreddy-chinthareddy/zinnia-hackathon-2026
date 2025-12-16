import { renderHook, waitFor } from '@testing-library/react';
import { setCookie } from 'cookies-next';

import { MOCK_COOKIE_KEY } from '@deps/queries/api-utils/serverClientUtils';

import useMock from './useMock';

// Mock next/router in case it's used inside the component later
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

// Simulate cookie state
let cookie: string | undefined = undefined;

jest.mock('cookies-next', () => ({
    getCookie: jest.fn((key: string) => {
        if (key === MOCK_COOKIE_KEY) return cookie;
    }),
    setCookie: jest.fn((key: string, value: string) => {
        if (key === MOCK_COOKIE_KEY) cookie = value;
    }),
    deleteCookie: jest.fn((key: string) => {
        if (key === MOCK_COOKIE_KEY) cookie = undefined;
    }),
    hasCookie: jest.fn(() => cookie !== undefined),
}));

describe('useMock hook', () => {
    beforeEach(() => {
        cookie = undefined; // Reset cookie before each test
        jest.clearAllMocks();
    });

    it('should have mock off by default', () => {
        const { result } = renderHook(() => useMock());

        expect(result.current.isMockOn).toBe(false);
        expect(result.current.mockText).toBe('Turn Mocks On');
    });

    it('should reflect mock as ON if cookie is set', async () => {
        setCookie(MOCK_COOKIE_KEY, 'on');

        const { result } = renderHook(() => useMock());

        await waitFor(() => {
            expect(result.current.isMockOn).toBe(true);
            expect(result.current.mockText).toBe('Turn Mocks Off');
        });
    });
    it('should toggle the cookie and redirect when setMock is called', () => {
        delete (window as any).location;
        (window as any).location = {
            href: '',
            origin: 'http://localhost',
            search: '?foo=bar&mock=true',
        };

        const { result } = renderHook(() => useMock());

        // Simulate the anchor click event
        const fakeEvent = {
            preventDefault: jest.fn(),
        } as unknown as React.MouseEvent<HTMLAnchorElement>;

        result.current.setMock(fakeEvent);

        expect(fakeEvent.preventDefault).toHaveBeenCalled();

        // Cookie should be set when mocks were OFF
        expect(setCookie).toHaveBeenCalledWith(MOCK_COOKIE_KEY, 'on');

        expect(window.location.href).toBe(
            'http://localhost/policies?foo=bar&mock=true'
        );
    });
});
