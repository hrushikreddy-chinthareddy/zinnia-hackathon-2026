import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

import {
    AxiosAuthRequestConfig,
    serverApi,
} from '@deps/queries/api-utils/serverApiClient';
import { LoggingContext } from '@deps/utils/server-logging';

import { createProxyRequestHandler } from './api-proxy';

jest.mock('@deps/queries/api-utils/serverApiClient');

const serverApiMock = jest.mocked(serverApi);

beforeEach(() => {
    jest.clearAllMocks();
});

const validateAxiosParams =
    (expectedConfig: AxiosAuthRequestConfig) =>
    ({
        url,
        method,
        params,
        authorization,
        validateStatus,
    }: AxiosAuthRequestConfig) => {
        expect(validateStatus?.(500)).toEqual(true);

        expect(url).toEqual(expectedConfig.url);
        expect(method).toEqual(expectedConfig.method);
        expect(params).toEqual(expectedConfig.params ?? {});
        expect(authorization).toEqual(
            expectedConfig?.authorization ?? 'Bearer test-token'
        );
    };

describe('createProxyRequestHandler', () => {
    const logCtx = {} as LoggingContext;

    it('fails with invalid options', () => {
        expect(() =>
            createProxyRequestHandler({
                upstreamBaseURL: undefined,
                matchedURLPath: '/api',
                getAuthToken: async () => 'test-token',
            })
        ).toThrow();

        expect(() =>
            createProxyRequestHandler({
                upstreamBaseURL: 'https://test.com',
                matchedURLPath: '/api/',
                getAuthToken: async () => 'test-token',
            })
        ).toThrow();
    });

    it('correctly forwards a GET request', async () => {
        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            getAuthToken: async () => 'test-token',
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            url: '/api/test',
        });

        serverApiMock.request.mockImplementationOnce((config, _logCtx) => {
            validateAxiosParams({
                url: 'https://test.com/test',
                method: 'GET',
            })(config);

            return Promise.resolve({
                status: 200,
                data: {
                    success: true,
                },
            });
        });

        await routeHandler(req, res, logCtx);

        expect(serverApiMock.request).toHaveBeenCalled();
        expect(res._getJSONData()).toEqual({
            success: true,
        });
    });

    it('correctly forwards a POST request', async () => {
        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            getAuthToken: async () => 'test-token',
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            url: '/api/test',
            body: {
                payload: 'test-payload',
            },
        });

        serverApiMock.request.mockImplementationOnce((config, _logCtx) => {
            validateAxiosParams({
                url: 'https://test.com/test',
                method: 'POST',
                data: {
                    payload: 'test-payload',
                },
            })(config);

            return Promise.resolve({
                status: 200,
                data: {
                    success: true,
                },
            });
        });

        await routeHandler(req, res, logCtx);

        expect(serverApiMock.request).toHaveBeenCalled();
        expect(res._getJSONData()).toEqual({
            success: true,
        });
    });

    it('correctly block unallowed HTTP methods', async () => {
        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            allowedMethods: ['GET'],
            getAuthToken: async () => 'test-token',
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            url: '/api/test',
            body: {
                payload: 'test-payload',
            },
        });
        await routeHandler(req, res, logCtx);

        expect(serverApiMock.request).not.toHaveBeenCalled();
        expect(res.statusCode).toEqual(405);
    });

    it('does not forward omitted query parameters', async () => {
        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            omittedParams: ['id'],
            getAuthToken: async () => 'test-token',
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            url: '/api/test',
            query: {
                id: 'test-id',
                search: 'test-query',
            },
        });

        serverApiMock.request.mockImplementationOnce((config, _logCtx) => {
            validateAxiosParams({
                url: 'https://test.com/test',
                method: 'GET',
                params: {
                    search: 'test-query',
                },
            })(config);

            return Promise.resolve({
                status: 200,
                data: {
                    success: true,
                },
            });
        });

        await routeHandler(req, res, logCtx);

        expect(serverApiMock.request).toHaveBeenCalled();
        expect(res._getJSONData()).toEqual({
            success: true,
        });
    });

    it('correctly forwards responses with error status codes', async () => {
        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            getAuthToken: async () => 'test-token',
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            url: '/api/test',
        });

        serverApiMock.request.mockImplementationOnce(async (_, _logCtx) => ({
            status: 404,
            statusText: 'Not Found',
            data: {
                message: 'Item Not Found',
            },
        }));

        await routeHandler(req, res, logCtx);

        expect(serverApiMock.request).toHaveBeenCalled();
        expect(res.statusCode).toEqual(404);
        expect(res._getJSONData()).toEqual({
            err: 'Not Found',
            message: 'Item Not Found',
        });
    });

    it('correctly handles network errors', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            url: '/api/test',
        });

        serverApiMock.request.mockImplementationOnce(async (_, _logCtx) => {
            throw new Error('Some error');
        });

        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            getAuthToken: async () => 'test-token',
        });

        await routeHandler(req, res, logCtx);

        expect(serverApiMock.request).toHaveBeenCalled();
        expect(res.statusCode).toEqual(500);
        expect(res._getJSONData()).toEqual({
            err: 'Internal error',
        });
    });

    it('calls the onProxyRes handler', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            url: '/api/test',
        });

        serverApiMock.request.mockImplementationOnce(async (_, _logCtx) => ({
            status: 200,
            data: {
                success: true,
            },
        }));

        const onProxyRes = jest.fn((proxyRes, _, res, __) => {
            expect(proxyRes.status).toEqual(200);
            expect(proxyRes.data).toEqual({
                success: true,
            });

            res.status(404).json({
                err: 'Not Found',
            });
        });
        const onProxyErr = jest.fn();

        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            getAuthToken: async () => 'test-token',
            onProxyRes: onProxyRes,
            onProxyErr: onProxyErr,
        });

        await routeHandler(req, res, logCtx);

        expect(onProxyRes).toHaveBeenCalled();
        expect(onProxyErr).not.toHaveBeenCalled();

        expect(res.statusCode).toEqual(404);
        expect(res._getJSONData()).toEqual({
            err: 'Not Found',
        });
    });

    it('calls the onProxyErr handler', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            url: '/api/test',
        });

        serverApiMock.request.mockImplementationOnce(async (_, _logCtx) => ({
            status: 404,
            data: {
                message: 'Not Found',
            },
        }));

        const onProxyRes = jest.fn();
        const onProxyErr = jest.fn((proxyRes, _, res, __) => {
            expect(proxyRes.status).toEqual(404);
            expect(proxyRes.data).toEqual({
                message: 'Not Found',
            });

            res.status(500).json({
                err: 'Some error',
            });
        });

        const routeHandler = createProxyRequestHandler({
            upstreamBaseURL: 'https://test.com',
            matchedURLPath: '/api',
            getAuthToken: async () => 'test-token',
            onProxyRes: onProxyRes,
            onProxyErr: onProxyErr,
        });

        await routeHandler(req, res, logCtx);

        expect(onProxyRes).not.toHaveBeenCalled();
        expect(onProxyErr).toHaveBeenCalled();

        expect(res.statusCode).toEqual(500);
        expect(res._getJSONData()).toEqual({
            err: 'Some error',
        });
    });
});
