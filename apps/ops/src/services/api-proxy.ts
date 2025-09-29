import { AxiosResponse } from 'axios';
import { getCookie } from 'cookies-next';
import { omit } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { SanitizerFn } from '@deps/utils/sanitizers';
import {
    logError,
    LoggingContext,
    logTrace,
    logWarn,
    parseErrorInformation,
    parseFailedNetworkRequest,
} from '@deps/utils/server-logging';

export type ApiErrorResponse = {
    err: string;
    message: string;
    errors: Record<string, string[]> | null;
    timestamp: string;
};
export const isApiResponseError = (obj: any): obj is ApiErrorResponse =>
    obj && 'err' in obj && 'message' in obj;

const sendProxyResponse = <T>(
    { status, data }: AxiosResponse<T>,
    req: NextApiRequest,
    res: NextApiResponse,
    loggingContext: LoggingContext,
    { sanitizer = (x) => x }: { sanitizer?: SanitizerFn<T> } = {}
) => {
    logTrace('api-proxy::sendRequest', {
        ...loggingContext,
        function: 'sendProxyResponse',
        requestStatus: status,
    });

    if (status >= 200 && status < 300) {
        const isDemoUser =
            getCookie('demouser', { res, req })?.toString() === 'true';

        return res.status(status).json(
            sanitizer(data, {
                isDemoUser: isDemoUser,
            })
        );
    }

    res.status(status).json(data);
};

const sendProxyFailedResponse = <T>(
    proxyRes: AxiosResponse<T>,
    res: NextApiResponse,
    loggingContext: LoggingContext
) => {
    logWarn('api-proxy::sendProxyFailedResponse', {
        ...loggingContext,
        ...parseFailedNetworkRequest(proxyRes),
        function: 'sendProxyFailedResponse',
    });
    res.status(proxyRes.status).json({
        err: proxyRes.statusText,
        ...(typeof proxyRes.data === 'string'
            ? { data: proxyRes.data }
            : proxyRes.data),
    });
};

const getBodyParams = (req: NextApiRequest) => {
    return req.body && typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;
};

const validateMatchedPath = (pathname: string) => {
    if (!pathname.startsWith('/')) {
        throw new Error(`${pathname} should start with  "/"`);
    }

    if (pathname.endsWith('/')) {
        throw new Error(`${pathname} should not end with  "/"`);
    }
};

const buildForwardURL = (
    upstreamBaseURL: string,
    matchedURLPath: string,
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const urlObj = new URL(`https://example.com${req.url}`);

    if (!urlObj.pathname.startsWith(matchedURLPath)) {
        res.status(500).json({
            err: 'Internal error',
        });
        throw Error(
            `Path: "${urlObj.pathname}" does not match "${matchedURLPath}"`
        );
    }

    const forwardPath = urlObj.pathname.substring(matchedURLPath.length);
    return `${upstreamBaseURL}${forwardPath}`;
};

type ProxyResHandler<T> = (
    /**
     * Axios response from the upstream server
     */
    proxyRes: AxiosResponse<T>,
    req: NextApiRequest,
    res: NextApiResponse,
    logCtx: LoggingContext
) => Promise<unknown> | void;

const allAllowedHttpMethods = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
    'TRACE',
] as const;

export type CreateRequestHandlerOptions<T = any> = {
    upstreamBaseURL: string | undefined;
    /**
     * Portion of the URL that won't be appended to the forwarded URL
     */
    matchedURLPath: string;
    getAuthToken: (
        req: NextApiRequest,
        res: NextApiResponse
    ) => Promise<string | null>;
    /**
     * Array of HTTP methods that will be allowed
     */
    allowedMethods?: readonly (typeof allAllowedHttpMethods)[number][];
    /**
     * Query parameters that should not be forwarded.
     * Useful for next dynamic route parameters
     */
    omittedParams?: string[];
    sanitizer?: SanitizerFn<any>;
    /**
     *
     * Returns additional header values to be sent with the request tot he upstream server
     *
     */
    getAdditionalHeaders?: (
        req: NextApiRequest,
        logCtx: LoggingContext
    ) => Record<string, string> | undefined;
    /**
     *
     * Function that will be called when the upstream server responds
     * with a non-error status
     *
     */
    onProxyRes?: ProxyResHandler<T>;
    /**
     *
     * Function that will be executed when the upstream server responds
     * with an error status (>= 400)
     *
     */
    onProxyErr?: ProxyResHandler<T>;
};

export const createProxyRequestHandler = <T = any>({
    upstreamBaseURL,
    matchedURLPath,
    omittedParams,
    allowedMethods = allAllowedHttpMethods,
    sanitizer,
    getAuthToken,
    getAdditionalHeaders,
    onProxyRes,
    onProxyErr,
}: CreateRequestHandlerOptions<T>) => {
    if (!upstreamBaseURL) {
        throw new Error(
            `upstreamBaseURL cannot be ${JSON.stringify(upstreamBaseURL)}`
        );
    }

    validateMatchedPath(matchedURLPath);

    return async (
        req: NextApiRequest,
        res: NextApiResponse,
        logCtx: LoggingContext
    ) => {
        const loggingContext = {
            ...logCtx,
            file: 'services/api-proxy',
            function: 'requestHandler',
        } as LoggingContext;

        if (!(allowedMethods as (string | undefined)[]).includes(req.method)) {
            logWarn('api-proxy::requestHandler::unallowed-method', {
                requestPath: req.url,
                requestMethod: req.method,
                ...loggingContext,
            });
            return res.status(405).json({
                err: 'Method Not Allowed',
            });
        }

        const forwardURL = buildForwardURL(
            upstreamBaseURL,
            matchedURLPath,
            req,
            res
        );

        let authToken: string | null;

        try {
            authToken = await getAuthToken(req, res);
            if (!authToken) {
                throw new Error('Could not authenticate user');
            }
        } catch (e: any) {
            logWarn('api-proxy::requestHandler::unauthorized', {
                ...parseErrorInformation(e),
                ...loggingContext,
            });
            res.status(401).json({ err: e.code });
        }

        let result: AxiosResponse<T>;

        logTrace('api-proxy::requestHandler::handling request', {
            ...loggingContext,
        });

        try {
            result = await serverApi.request<T>(
                {
                    url: forwardURL,
                    method: req.method,
                    params: omittedParams
                        ? omit(req.query, omittedParams)
                        : req.query,
                    headers: getAdditionalHeaders?.(req, logCtx),
                    validateStatus: () => true,
                    data: getBodyParams(req),
                    authorization: `Bearer ${authToken!}`,
                },
                logCtx
            );
        } catch (err: any) {
            logError('api-proxy::requestHandler::error', {
                ...parseErrorInformation(err),
                ...loggingContext,
                url: forwardURL,
            });
            return res.status(500).json({ err: 'Internal error' });
        }

        if (result!.status < 400) {
            await onProxyRes?.(result!, req, res, logCtx);
        } else {
            await onProxyErr?.(result!, req, res, logCtx);
        }

        if (res.writableEnded) {
            // Do nothing if the handlers already sent the response
            return;
        }

        if (result!.status >= 400) {
            return sendProxyFailedResponse(result!, res, logCtx);
        }

        sendProxyResponse(result!, req, res, logCtx, { sanitizer });
    };
};
