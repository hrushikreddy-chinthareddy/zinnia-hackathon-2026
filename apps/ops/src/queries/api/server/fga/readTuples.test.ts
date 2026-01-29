import { getSession } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';

import { getUserData } from '@deps/helpers/query-data.helpers';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import {
    getRolesFromCookie,
    setRolesCookie,
} from '@deps/utils/permissionsCookie';
import { LoggingContext } from '@deps/utils/server-logging';

import * as readTuplesModule from './readTuples';

jest.mock('@auth0/nextjs-auth0');
jest.mock('@deps/services/enterprise-api-token-http');
jest.mock('@deps/helpers/query-data.helpers');
jest.mock('@deps/utils/permissionsCookie');

const EnterpriseTokenApiMock = jest.mocked(EnterpriseTokenApi);
const getSessionMock = jest.mocked(getSession);
const getUserDataMock = jest.mocked(getUserData);
const getRolesFromCookieMock = jest.mocked(getRolesFromCookie);
const setRolesCookieMock = jest.mocked(setRolesCookie);

const mkCtx = () =>
    ({
        req: { headers: {}, method: 'GET', url: '/tasks' },
        res: {},
        query: {},
        params: {},
        resolvedUrl: '/tasks',
    } as GetServerSidePropsContext);

describe('readTuples', () => {
    const logCtx = {
        correlationId: 'test',
        inputs: undefined,
    } as LoggingContext;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('readUserTuples', () => {
        it('returns a 400 error response when accessToken is missing', async () => {
            const res = await readTuplesModule.readUserTuples(
                '',
                'a=b',
                logCtx
            );
            expect(res).toEqual({
                data: null,
                error: {
                    status: 400,
                    message: 'Missing partyId or accessToken',
                    name: 'Error reading tuple',
                },
            });
            expect(EnterpriseTokenApiMock.get).not.toHaveBeenCalled();
        });

        it('returns data when server responds 200', async () => {
            EnterpriseTokenApiMock.get.mockResolvedValueOnce({
                status: 200,
                statusText: 'OK',
                json: async () => ({
                    tuples: [{ key: { object: 'role:ABC_admin' } }],
                }),
            } as any);

            const res = await readTuplesModule.readUserTuples(
                'token',
                'q=1',
                logCtx
            );

            expect(EnterpriseTokenApiMock.get).toHaveBeenCalledTimes(1);
            expect(res).toEqual({
                data: { tuples: [{ key: { object: 'role:ABC_admin' } }] },
                error: null,
            });
        });

        it('returns an error object when server responds non-200', async () => {
            EnterpriseTokenApiMock.get.mockResolvedValueOnce({
                status: 403,
                statusText: 'Forbidden',
                json: async () => null,
            } as any);

            const res = await readTuplesModule.readUserTuples(
                'token',
                'q=1',
                logCtx
            );

            expect(EnterpriseTokenApiMock.get).toHaveBeenCalledTimes(1);
            expect(res).toEqual({
                data: null,
                error: {
                    status: 403,
                    message: 'Forbidden',
                    name: 'Error reading users tuple',
                },
            });
        });

        it('returns a 500 error object when the request throws', async () => {
            EnterpriseTokenApiMock.get.mockRejectedValueOnce(new Error('boom'));

            const res = await readTuplesModule.readUserTuples(
                'token',
                'q=1',
                logCtx
            );

            expect(EnterpriseTokenApiMock.get).toHaveBeenCalledTimes(1);
            expect(res).toEqual({
                data: null,
                error: {
                    status: 500,
                    message: 'boom',
                    name: 'Error checking tuple',
                },
            });
        });
    });

    describe('readAndStoreUserRolesCookie', () => {
        const loggingContext = {
            ...logCtx,
            file: 'test',
            function: 'test',
            method: 'GET',
            page: 'tasks',
            params: {},
            referrer: '',
            url: '/tasks',
            user: undefined,
        } as LoggingContext;

        it('returns roles from cookie when present and does not fetch tuples', async () => {
            const ctx = mkCtx();
            getRolesFromCookieMock.mockReturnValueOnce({ admin: ['ABC'] });

            const res = await readTuplesModule.readAndStoreUserRolesCookie(
                ctx,
                loggingContext
            );

            expect(res).toEqual({ admin: ['ABC'] });
            expect(EnterpriseTokenApiMock.get).not.toHaveBeenCalled();
            expect(setRolesCookieMock).not.toHaveBeenCalled();
        });

        it('fetches tuples, parses carrier/role map, and sets roles cookie when missing', async () => {
            const ctx = mkCtx();
            getRolesFromCookieMock.mockReturnValueOnce(undefined);
            getUserDataMock.mockResolvedValueOnce({
                partyId: 'party-1',
            } as any);
            getSessionMock.mockResolvedValueOnce({
                accessToken: 'token',
            } as any);

            EnterpriseTokenApiMock.get.mockResolvedValueOnce({
                status: 200,
                statusText: 'OK',
                json: async () => ({
                    tuples: [
                        { key: { object: 'role:ABC_admin' } },
                        { key: { object: 'role:XYZ_admin' } },
                        { key: { object: 'role:ABC_viewer' } },
                    ],
                }),
            } as any);

            const res = await readTuplesModule.readAndStoreUserRolesCookie(
                ctx,
                loggingContext
            );

            expect(res).toEqual({
                admin: ['ABC', 'XYZ'],
                viewer: ['ABC'],
            });
            expect(EnterpriseTokenApiMock.get).toHaveBeenCalledTimes(1);
            expect(setRolesCookieMock).toHaveBeenCalledTimes(1);
            expect(setRolesCookieMock).toHaveBeenCalledWith(
                {
                    admin: ['ABC', 'XYZ'],
                    viewer: ['ABC'],
                },
                ctx.req,
                ctx.res
            );
        });

        it('ignores malformed tuples and returns empty map when no valid role tuples exist', async () => {
            const ctx = mkCtx();
            getRolesFromCookieMock.mockReturnValueOnce(undefined);
            getUserDataMock.mockResolvedValueOnce({
                partyId: 'party-1',
            } as any);
            getSessionMock.mockResolvedValueOnce({
                accessToken: 'token',
            } as any);

            EnterpriseTokenApiMock.get.mockResolvedValueOnce({
                status: 200,
                statusText: 'OK',
                json: async () => ({
                    tuples: [
                        { key: { object: 'role:ABC' } },
                        { key: { object: 'not-a-role' } },
                        { key: {} },
                        {},
                    ],
                }),
            } as any);

            const res = await readTuplesModule.readAndStoreUserRolesCookie(
                ctx,
                loggingContext
            );

            expect(res).toEqual({});
            expect(EnterpriseTokenApiMock.get).toHaveBeenCalledTimes(1);
            expect(setRolesCookieMock).toHaveBeenCalledTimes(1);
            expect(setRolesCookieMock).toHaveBeenCalledWith(
                {},
                ctx.req,
                ctx.res
            );
        });
    });
});
