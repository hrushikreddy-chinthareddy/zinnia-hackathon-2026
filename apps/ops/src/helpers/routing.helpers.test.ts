jest.mock('../../next-i18next.config', () => ({
    i18n: { defaultLocale: 'en', locales: ['en', 'es'] },
}));

jest.mock('cookies-next', () => ({
    setCookie: jest.fn(),
}));

jest.mock('./string.helpers', () => ({
    toSentenceCase: (s: string) => `SC:${s}`,
}));

import { cleanup } from '@testing-library/react';
import { setCookie } from 'cookies-next';
import { createRef } from 'react';

import {
    DEFAULT_LOCALE,
    ALL_LOCALES,
    lPrefix,
    setNextLocaleCookie,
    goTo,
    convertToQueryString,
    getBreadcrumbText,
    scrollToElement,
} from './routing.helpers';

import type { NextRouter } from 'next/router';

describe('helpers/routing.helpers', () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    describe('locale config and lPrefix', () => {
        it('exposes DEFAULT_LOCALE and ALL_LOCALES from next-i18next config', () => {
            expect(DEFAULT_LOCALE).toBe('en');
            expect(ALL_LOCALES).toEqual(['en', 'es']);
        });

        it('returns empty string for default or en locale', () => {
            expect(lPrefix({ locale: 'en' })).toBe('');
            expect(lPrefix({})).toBe('');
        });

        it('returns prefixed/ suffixed string for non-default locale', () => {
            expect(lPrefix({ locale: 'es' })).toBe('es');
            expect(lPrefix({ prefix: '/', locale: 'es' })).toBe('/es');
            expect(lPrefix({ prefix: '/', locale: 'es', suffix: '/' })).toBe(
                '/es/'
            );
        });
    });

    describe('setNextLocaleCookie', () => {
        it('sets NEXT_LOCALE cookie with req/res, maxAge and path', () => {
            const req = {} as any;
            const res = {} as any;
            setNextLocaleCookie('es', req, res);
            expect(setCookie).toHaveBeenCalledWith('NEXT_LOCALE', 'es', {
                req,
                res,
                maxAge: 60 * 60 * 24,
                path: '/',
            });
        });
    });

    describe('goTo', () => {
        const makeRouter = () =>
            ({
                push: jest.fn(),
                replace: jest.fn(),
            } as unknown as NextRouter);

        it('pushes to formatted route with params replaced', () => {
            const router = makeRouter();
            goTo('/cases/[id]/docs/[docId]', router, { id: '123', docId: 9 });
            expect((router as any).push).toHaveBeenCalledWith(
                '/cases/123/docs/9'
            );
            expect((router as any).replace).not.toHaveBeenCalled();
        });

        it('replaces route when option replace=true', () => {
            const router = makeRouter();
            goTo('/cases/[id]', router, { id: 'abc' }, { replace: true });
            expect((router as any).replace).toHaveBeenCalledWith('/cases/abc');
            expect((router as any).push).not.toHaveBeenCalled();
        });

        it('leaves path unchanged when no params provided', () => {
            const router = makeRouter();
            goTo('/home', router);
            expect((router as any).push).toHaveBeenCalledWith('/home');
        });
    });

    describe('convertToQueryString', () => {
        it('serializes primitives and arrays; encodes values', () => {
            const out = convertToQueryString({
                a: 'x y',
                b: 2,
                c: true,
                d: ['u', 'v w'],
            });
            expect(out).toBe('?a=x%20y&b=2&c=true&d=u&d=v%20w');
        });

        it('handles empty object', () => {
            expect(convertToQueryString({} as any)).toBe('?');
        });
    });

    describe('getBreadcrumbText', () => {
        const t = ((key: string, opts?: any) => {
            if (key === 'breadcrumb') return `breadcrumb:${opts?.path}`;
            return key;
        }) as any;

        it('applies sentence case via helper when URL not in exceptions', () => {
            const out = getBreadcrumbText(t, 'My TITLE', '/some/page');
            expect(out).toBe('SC:breadcrumb:My TITLE');
        });

        it('does not change case when URL matches people detail exception', () => {
            const out = getBreadcrumbText(
                t,
                'Person Name',
                '/people/507f1f77bcf86cd799439011'
            );
            expect(out).toBe('breadcrumb:Person Name');
        });
    });

    describe('scrollToElement', () => {
        it('scrolls by scrollAmount when positive', () => {
            const container = document.createElement('div');
            Object.defineProperty(container, 'children', {
                value: [
                    {
                        children: [
                            document.createElement('div'),
                            document.createElement('div'),
                        ],
                    },
                ],
            });
            container.scrollLeft = 0;
            (container as any).getBoundingClientRect = () =>
                ({ left: 10 } as any);
            const ref = {
                current: container as HTMLDivElement,
            } as React.RefObject<HTMLDivElement>;

            scrollToElement(ref, 1, 50);
            expect(container.scrollLeft).toBe(50);
        });

        it('scrolls to bring element into view when scrollAmount is 0 or negative', () => {
            const container = document.createElement('div');
            const child0 = document.createElement('div');
            const child1 = document.createElement('div');
            (child1 as any).getBoundingClientRect = () =>
                ({ left: 110 } as any);
            Object.defineProperty(container, 'children', {
                value: [
                    {
                        children: [child0, child1],
                    },
                ],
            });
            container.scrollLeft = 5;
            (container as any).getBoundingClientRect = () =>
                ({ left: 10 } as any);
            const ref = {
                current: container as HTMLDivElement,
            } as React.RefObject<HTMLDivElement>;

            scrollToElement(ref, 1, 0);
            // elementLeft(110) - containerLeft(10) = 100; previous scrollLeft 5 -> now 105
            expect(container.scrollLeft).toBe(105);
        });

        it('does nothing if no container or invalid index', () => {
            const ref = createRef<HTMLDivElement>();
            scrollToElement(ref, -1, 100);
            expect(ref.current).toBeNull();
        });
    });
});
