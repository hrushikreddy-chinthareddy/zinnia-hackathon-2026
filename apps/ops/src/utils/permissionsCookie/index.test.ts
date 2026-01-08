import { getCookie, setCookie } from 'cookies-next';

import { logWarn } from '@deps/utils/server-logging';

jest.mock('cookies-next', () => ({
    getCookie: jest.fn(),
    setCookie: jest.fn(),
}));

jest.mock('@deps/utils/server-logging', () => ({
    logWarn: jest.fn(),
}));

describe('permissionsCookie', () => {
    const getCookieMock = jest.mocked(getCookie);
    const setCookieMock = jest.mocked(setCookie);
    let originalBaseUrl: string | undefined;

    beforeEach(() => {
        originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
    });

    const loadModule = async () => {
        let mod: typeof import('./index') | undefined;
        await jest.isolateModulesAsync(async () => {
            mod = await import('./index');
        });
        return mod!;
    };

    describe('setRolesCookie', () => {
        it('sets roles cookie with expected options (non-https)', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { setRolesCookie } = await loadModule();
            setRolesCookie({ admin: ['ABC'] }, { req: 1 }, {
                res: 2,
            } as any);

            expect(setCookieMock).toHaveBeenCalledTimes(1);
            expect(setCookieMock).toHaveBeenCalledWith(
                'user-roles',
                JSON.stringify({ admin: ['ABC'] }),
                expect.objectContaining({
                    httpOnly: false,
                    sameSite: 'lax',
                    path: '/',
                    secure: false,
                    req: { req: 1 },
                    res: { res: 2 },
                })
            );
        });

        it('sets roles cookie with expected options (https)', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'https://localhost:3000';
            const { setRolesCookie } = await loadModule();
            setRolesCookie({ admin: ['ABC'] }, { req: 1 }, {
                res: 2,
            } as any);

            expect(setCookieMock).toHaveBeenCalledTimes(1);
            expect(setCookieMock).toHaveBeenCalledWith(
                '__Host-user-roles',
                JSON.stringify({ admin: ['ABC'] }),
                expect.objectContaining({
                    httpOnly: false,
                    sameSite: 'lax',
                    path: '/',
                    secure: true,
                    req: { req: 1 },
                    res: { res: 2 },
                })
            );
        });

        it('logs and swallows errors', async () => {
            const { setRolesCookie } = await loadModule();
            setCookieMock.mockImplementationOnce(() => {
                throw new Error('boom');
            });

            setRolesCookie({ admin: ['ABC'] });

            expect(logWarn).toHaveBeenCalledTimes(1);
        });
    });

    describe('getRolesFromCookie', () => {
        it('returns undefined when roles cookie missing', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { getRolesFromCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce(undefined);

            const res = getRolesFromCookie({ req: 1 }, {
                res: 2,
            } as any);

            expect(res).toBeUndefined();
        });

        it('parses and returns roles from cookie', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { getRolesFromCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce(
                JSON.stringify({ admin: ['ABC'] })
            );

            const res = getRolesFromCookie();

            expect(res).toEqual({ admin: ['ABC'] });
        });

        it('returns undefined and logs when malformed json', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { getRolesFromCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce('not-json');

            const res = getRolesFromCookie();

            expect(res).toBeUndefined();
            expect(logWarn).toHaveBeenCalledTimes(1);
        });
    });

    describe('addTupleToCookie', () => {
        it('creates permissions cookie when missing and adds tuple (non-https)', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { addTupleToCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce(undefined);

            addTupleToCookie('can_view', 'role:ABC_admin', true, { req: 1 }, {
                res: 2,
            } as any);

            expect(setCookieMock).toHaveBeenCalledTimes(1);
            const [, rawValue, options] = setCookieMock.mock.calls[0];
            expect(options).toEqual(
                expect.objectContaining({
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: false,
                    req: { req: 1 },
                    res: { res: 2 },
                })
            );
            expect(setCookieMock.mock.calls[0][0]).toBe('fga-permissions');

            const parsed = JSON.parse(rawValue as string);
            expect(parsed.tuples.can_view['role:ABC_admin']).toBe(true);
        });

        it('creates permissions cookie when missing and adds tuple (https)', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'https://localhost:3000';
            const { addTupleToCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce(undefined);

            addTupleToCookie('can_view', 'role:ABC_admin', true, { req: 1 }, {
                res: 2,
            } as any);

            expect(setCookieMock).toHaveBeenCalledTimes(1);
            const [, rawValue, options] = setCookieMock.mock.calls[0];
            expect(options).toEqual(
                expect.objectContaining({
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: true,
                    req: { req: 1 },
                    res: { res: 2 },
                })
            );
            expect(setCookieMock.mock.calls[0][0]).toBe(
                '__Host-fga-permissions'
            );

            const parsed = JSON.parse(rawValue as string);
            expect(parsed.tuples.can_view['role:ABC_admin']).toBe(true);
        });

        it('logs and swallows errors on malformed permissions cookie', async () => {
            const { addTupleToCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce('not-json');

            addTupleToCookie('can_view', 'x', true);

            expect(setCookieMock).not.toHaveBeenCalled();
            expect(logWarn).toHaveBeenCalledTimes(1);
        });
    });

    describe('addCarrierListToCookie', () => {
        it('adds carrier list for relation', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { addCarrierListToCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce('{"tuples":{},"carriers":{}}');

            addCarrierListToCookie('can_write', ['ABC', 'XYZ']);

            expect(setCookieMock).toHaveBeenCalledTimes(1);
            expect(setCookieMock.mock.calls[0][0]).toBe('fga-permissions');
            const parsed = JSON.parse(setCookieMock.mock.calls[0][1] as string);
            expect(parsed.carriers.can_write).toEqual(['ABC', 'XYZ']);
        });

        it('adds carrier list for relation (https)', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'https://localhost:3000';
            const { addCarrierListToCookie } = await loadModule();
            getCookieMock.mockReturnValueOnce('{"tuples":{},"carriers":{}}');

            addCarrierListToCookie('can_write', ['ABC', 'XYZ']);

            expect(setCookieMock).toHaveBeenCalledTimes(1);
            expect(setCookieMock.mock.calls[0][0]).toBe(
                '__Host-fga-permissions'
            );
            const parsed = JSON.parse(setCookieMock.mock.calls[0][1] as string);
            expect(parsed.carriers.can_write).toEqual(['ABC', 'XYZ']);
        });
    });

    describe('checkPermissionsCookieForTuple', () => {
        it('returns undefined when cookie missing', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { checkPermissionsCookieForTuple } = await loadModule();
            getCookieMock.mockReturnValueOnce(undefined);

            const res = checkPermissionsCookieForTuple('can_view', 'x');

            expect(res).toBeUndefined();
        });

        it('returns tuple value when present', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { checkPermissionsCookieForTuple } = await loadModule();
            getCookieMock.mockReturnValueOnce(
                JSON.stringify({
                    tuples: { can_view: { x: true } },
                    carriers: {},
                })
            );

            const res = checkPermissionsCookieForTuple('can_view', 'x');

            expect(res).toBe(true);
        });

        it('returns undefined and logs when relation missing', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { checkPermissionsCookieForTuple } = await loadModule();
            const res = checkPermissionsCookieForTuple('', 'x');

            expect(res).toBeUndefined();
            expect(logWarn).toHaveBeenCalledTimes(1);
        });
    });

    describe('checkPermissionsCookieForCarrierList', () => {
        it('returns carrier list when present', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { checkPermissionsCookieForCarrierList } = await loadModule();
            getCookieMock.mockReturnValueOnce(
                JSON.stringify({ tuples: {}, carriers: { can_view: ['ABC'] } })
            );

            const res = checkPermissionsCookieForCarrierList('can_view');

            expect(res).toEqual(['ABC']);
        });
    });

    describe('doesPermissionsHaveCarrierRelation', () => {
        it('returns false when cookie missing', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { doesPermissionsHaveCarrierRelation } = await loadModule();
            getCookieMock.mockReturnValueOnce(undefined);

            const res = doesPermissionsHaveCarrierRelation('can_view', 'ABC');

            expect(res).toBe(false);
        });

        it('returns true when carrier is in relation list', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { doesPermissionsHaveCarrierRelation } = await loadModule();
            getCookieMock.mockReturnValueOnce(
                JSON.stringify({
                    tuples: {},
                    carriers: { can_view: ['ABC', 'XYZ'] },
                })
            );

            const res = doesPermissionsHaveCarrierRelation('can_view', 'XYZ');

            expect(res).toBe(true);
        });

        it('returns false and logs when relation missing', async () => {
            process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
            const { doesPermissionsHaveCarrierRelation } = await loadModule();
            const res = doesPermissionsHaveCarrierRelation('', 'ABC');

            expect(res).toBe(false);
            expect(logWarn).toHaveBeenCalledTimes(1);
        });
    });
});
