import { cleanup } from '@testing-library/react';

import { isLocalStorageEnabled } from './local-storage.hepler';

describe('helpers/local-storage.hepler', () => {
    const originalWindow = global.window as any;

    afterEach(() => {
        jest.restoreAllMocks();
        Object.defineProperty(global, 'window', {
            value: originalWindow,
            configurable: true,
            writable: true,
        });
        cleanup();
    });

    it('returns truthy when window.localStorage exists (browser/jsdom)', () => {
        expect(isLocalStorageEnabled()).toBeTruthy();
    });

    it('returns falsy when window exists but localStorage is undefined', () => {
        const getSpy = jest.spyOn(window as any, 'localStorage', 'get');
        getSpy.mockReturnValue(undefined as any);
        expect(isLocalStorageEnabled()).toBeFalsy();
    });

    it('returns falsy when executed in SSR where window is undefined', () => {
        Object.defineProperty(global, 'window', {
            value: undefined,
            configurable: true,
        });
        expect(isLocalStorageEnabled()).toBeFalsy();
    });

    it('returns falsy when window is null', () => {
        Object.defineProperty(global, 'window', {
            value: null,
            configurable: true,
        });
        expect(isLocalStorageEnabled()).toBeFalsy();
    });
});
