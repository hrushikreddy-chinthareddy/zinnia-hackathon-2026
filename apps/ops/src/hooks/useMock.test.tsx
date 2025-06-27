import { renderHook } from '@testing-library/react';
import { setCookie } from 'cookies-next';

import { MOCK_COOKIE_KEY } from '@deps/queries/api-utils/serverClientUtils';

import useMock from './useMock';

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

let cookie: undefined | string = undefined;
jest.mock('cookies-next', () => ({
    getCookie: jest.fn((key: string) => {
        switch (key) {
            case MOCK_COOKIE_KEY:
                return cookie;
        }
    }),
    setCookie: jest.fn((key: string, value: string) => {
        switch (key) {
            case MOCK_COOKIE_KEY:
                cookie = value;
        }
    }),
    hasCookie: jest.fn(() => {
        switch (cookie) {
            case undefined:
                return false;
            default:
                return true;
        }
    }),
}));

describe('Use Mock Hook', () => {
    it('mock initially should be off', () => {
        const { result } = renderHook(() => useMock());
        const { mockText, isMockOn } = result.current;

        expect(isMockOn).toBe(false);
        expect(mockText).toBe('Turn Mocks On');
    });

    // TODO: skipping for now until we can figure out what the heck is wrong with this thing and why it fails
    it('mock should be on', () => {
        setCookie(MOCK_COOKIE_KEY, 'on');
        const { result } = renderHook(() => useMock());
        const { mockText, isMockOn } = result.current;

        expect(isMockOn).toBe(true);
        expect(mockText).toBe('Turn Mocks Off');
    });
});
