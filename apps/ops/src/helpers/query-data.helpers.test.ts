import { getSession } from '@auth0/nextjs-auth0';
import { cleanup } from '@testing-library/react';

import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';

import {
    doesUserHavePagePermissions,
    getCompany,
    getInitialData,
    getUserData,
} from './query-data.helpers';

import type { GetServerSidePropsContext } from 'next';

const setCookieMock = jest.fn();
jest.mock('@auth0/nextjs-auth0', () => ({
    getSession: jest.fn(),
}));
jest.mock('cookies-next', () => ({
    setCookie: (...args: any[]) => setCookieMock(...args),
}));
jest.mock('@deps/queries/api/server/fga/listCarriers', () => ({
    listCarriersPage: jest.fn(),
}));
jest.mock('@deps/types/constants', () => ({
    PRODUCTION_HOST_NAME: 'open.zinnia.com',
}));

describe('helpers/query-data.helpers', () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    const mkDocCtx = (overrides: any = {}): any =>
        ({
            req: { headers: { host: 'localhost' } } as any,
            res: {} as any,
            query: {},
            ...overrides,
        } as any);

    const mkGsspCtx = (
        overrides: Partial<GetServerSidePropsContext> = {}
    ): GetServerSidePropsContext =>
        ({
            req: {} as any,
            res: {} as any,
            params: {},
            query: {},
            resolvedUrl: '/',
            ...overrides,
        } as any);

    describe('getInitialData', () => {
        it('sets demouser cookie in non-prod when query.demouser is provided and returns company from user', async () => {
            (getSession as jest.Mock).mockResolvedValue({
                user: { app_metadata: { company: 'acme' } },
            });
            const ctx = mkDocCtx({ query: { demouser: 'yes' } });
            const result = await getInitialData(ctx);
            expect(result).toEqual({ company: 'acme' });
            expect(setCookieMock).toHaveBeenCalledWith(
                'demouser',
                'yes',
                expect.objectContaining({ req: ctx.req, res: ctx.res })
            );
        });

        it('does not set demouser cookie in prod', async () => {
            (getSession as jest.Mock).mockResolvedValue({
                user: { app_metadata: { company: 'acme' } },
            });
            const ctx = mkDocCtx({
                query: { demouser: 'yes' },
                req: { headers: { host: 'open.zinnia.com' } } as any,
            });
            await getInitialData(ctx);
            expect(setCookieMock).not.toHaveBeenCalled();
        });

        it('returns default company when user missing metadata', async () => {
            (getSession as jest.Mock).mockResolvedValue({ user: {} });
            const ctx = mkDocCtx();
            const result = await getInitialData(ctx);
            expect(result).toEqual({ company: 'zinnia' });
        });
    });

    describe('getCompany', () => {
        it('returns user.app_metadata.company when present', () => {
            expect(
                getCompany({ app_metadata: { company: 'foo' } } as any)
            ).toBe('foo');
        });
        it('defaults to zinnia when missing', () => {
            expect(getCompany({} as any)).toBe('zinnia');
        });
    });

    describe('getUserData', () => {
        it('returns user from session', async () => {
            (getSession as jest.Mock).mockResolvedValue({
                user: { sub: 'u1' },
            });
            const out = await getUserData(mkGsspCtx());
            expect(out).toEqual({ sub: 'u1' });
        });
        it('handles missing session', async () => {
            (getSession as jest.Mock).mockResolvedValue(undefined);
            const out = await getUserData(mkGsspCtx());
            expect(out).toBeUndefined();
        });
    });

    describe('doesUserHavePagePermissions', () => {
        const ctx = mkGsspCtx();
        const logging = {} as any;

        it('returns true when carriers returned and carrier param is null', async () => {
            (listCarriersPage as jest.Mock).mockResolvedValue(['A', 'B']);
            await expect(
                doesUserHavePagePermissions(ctx, 'perm' as any, logging, null)
            ).resolves.toBe(true);
        });

        it('returns true when provided carrier is included in results', async () => {
            (listCarriersPage as jest.Mock).mockResolvedValue(['A', 'B']);
            await expect(
                doesUserHavePagePermissions(ctx, 'perm' as any, logging, 'B')
            ).resolves.toBe(true);
        });

        it('returns false when no carriers returned and carrier is null', async () => {
            (listCarriersPage as jest.Mock).mockResolvedValue([]);
            await expect(
                doesUserHavePagePermissions(ctx, 'perm' as any, logging, null)
            ).resolves.toBe(false);
        });

        it('returns false when carrier provided is not in results', async () => {
            (listCarriersPage as jest.Mock).mockResolvedValue(['A']);
            await expect(
                doesUserHavePagePermissions(ctx, 'perm' as any, logging, 'B')
            ).resolves.toBe(false);
        });
    });
});
