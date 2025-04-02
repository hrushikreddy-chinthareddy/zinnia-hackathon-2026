import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';

import { ErrorResponse } from '@deps/types/api';
import { SanitizerFn } from '@deps/utils/sanitizers';
import { buildNextApiLoggingContext, logError, LoggingContext, logTrace, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { serverApi } from './serverApiClient';

const sendRequest = <T>(
    req: NextApiRequest,
    res: NextApiResponse,
    { status, data }: AxiosResponse<T, any>,
    loggingContext: LoggingContext,
    sanitizer: SanitizerFn<T> = x => x
) => {
    logTrace('server::sendRequest', { ...loggingContext, function: 'sendRequest', requestStatus: status });
    if (status === 200 || status === 201) {
        const isDemoUser = getCookie('demouser', { res, req })?.toString() === 'true';
        res.json(
            sanitizer(data, {
                isDemoUser: isDemoUser,
            })
        );
    } else {
        res.status(status).json({ ...data } as unknown as ErrorResponse);
    }
};

const sendError = (res: NextApiResponse, ex: any, loggingContext: LoggingContext) => {
    logWarn('server::sendError', {
        ...parseErrorInformation(ex),
        ...loggingContext,
        function: 'sendError',
        requestStatus: ex.response?.status || ex.status || ex?.statusCode,
    });
    res.status(ex.response?.status || ex.status || ex?.statusCode || 502).json({
        err: ex.response?.statusText || ex.statusText || ex.message,
        ...(typeof ex?.data === 'object' ? ex?.data : { data: ex.data }),
    } as unknown as ErrorResponse);
};

const getBodyParams = (req: NextApiRequest) => {
    return req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
};

const postRequest = async <T>(
    url: string,
    req: NextApiRequest,
    res: NextApiResponse,
    accessToken: string | undefined,
    loggingContext: LoggingContext,
    sanitizer?: SanitizerFn<T>
) => {
    try {
        const data = getBodyParams(req);
        const result = await serverApi.post(url, data, { authorization: 'Bearer ' + accessToken }, loggingContext);

        sendRequest<T>(req, res, result, loggingContext, sanitizer);
    } catch (ex: any) {
        sendError(res, ex, loggingContext);
    }
};

const getRequest = async <T>(
    url: string,
    req: NextApiRequest,
    res: NextApiResponse,
    accessToken: string | undefined,
    loggingContext: LoggingContext,
    sanitizer?: SanitizerFn<T>
) => {
    try {
        const result = await serverApi.get(url, { authorization: 'Bearer ' + accessToken }, loggingContext);
        sendRequest(req, res, result, loggingContext, sanitizer);
    } catch (ex: any) {
        sendError(res, ex, loggingContext);
    }
};

const putRequest = async (
    url: string,
    req: NextApiRequest,
    res: NextApiResponse,
    accessToken: string | undefined,
    loggingContext: LoggingContext
) => {
    try {
        const data = getBodyParams(req);
        const result = await serverApi.put(url, data, { authorization: 'Bearer ' + accessToken }, loggingContext);
        sendRequest(req, res, result, loggingContext);
    } catch (ex: any) {
        sendError(res, ex, loggingContext);
    }
};

const deleteRequest = async (
    url: string,
    req: NextApiRequest,
    res: NextApiResponse,
    accessToken: string | undefined,
    loggingContext: LoggingContext
) => {
    try {
        const result = await serverApi.delete(url, { authorization: 'Bearer ' + accessToken }, loggingContext);
        sendRequest(req, res, result, loggingContext);
    } catch (ex: any) {
        sendError(res, ex, loggingContext);
    }
};

export const requestHandler = async <T>(url: string, req: NextApiRequest, res: NextApiResponse, sanitizer?: SanitizerFn<any>) => {
    const loggingContext = {
        ...(await buildNextApiLoggingContext(req, res)),
        file: 'queries/api-utils/server',
        function: 'requestHandler',
    } as LoggingContext;
    try {
        logTrace('server::requestHandler::handling request', loggingContext);
        const accessToken = (await getAccessToken(req, res)).accessToken;

        try {
            if (req.method === 'PUT') return await putRequest(url, req, res, accessToken, loggingContext);
            if (req.method === 'GET') return await getRequest<T>(url, req, res, accessToken, loggingContext, sanitizer);
            if (req.method === 'POST') return await postRequest<T>(url, req, res, accessToken, loggingContext, sanitizer);
            if (req.method === 'DELETE') return await deleteRequest(url, req, res, accessToken, loggingContext);
        } catch (err) {
            logError(`server::requestHandler::error`, {
                ...parseErrorInformation(err),
                ...loggingContext,
                url,
            });
            res.status(500).json({ err });
        }
    } catch (e: any) {
        logWarn('server::requestHandler::unauthorized', {
            ...parseErrorInformation(e),
            ...loggingContext,
        });
        res.status(401).json({ err: e.code });
    }
};
