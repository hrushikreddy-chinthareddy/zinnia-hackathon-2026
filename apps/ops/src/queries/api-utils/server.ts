import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';

import { ErrorResponse } from '@deps/types/api';
import { SanitizerFn } from '@deps/utils/sanitizers';
import { getUserInfoForLogging, logError, logTrace, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { serverApi } from './serverApiClient';

const sendRequest = <T>(
    req: NextApiRequest,
    res: NextApiResponse,
    { status, data }: AxiosResponse<T, any>,
    sanitizer: SanitizerFn<T> = x => x
) => {
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

const sendError = (res: NextApiResponse, ex: any) => {
    res.status(ex.response?.status || ex.status || 502).json({
        err: ex.response?.statusText || ex.statusText,
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
    loggingContext: any,
    sanitizer?: SanitizerFn<T>
) => {
    try {
        const data = getBodyParams(req);
        const result = await serverApi.post(url, data, { authorization: 'Bearer ' + accessToken }, loggingContext);

        sendRequest<T>(req, res, result, sanitizer);
    } catch (ex: any) {
        sendError(res, ex);
    }
};

const getRequest = async <T>(
    url: string,
    req: NextApiRequest,
    res: NextApiResponse,
    accessToken: string | undefined,
    loggingContext: any,
    sanitizer?: SanitizerFn<T>
) => {
    try {
        const result = await serverApi.get(url, { authorization: 'Bearer ' + accessToken }, loggingContext);
        sendRequest(req, res, result, sanitizer);
    } catch (ex: any) {
        sendError(res, ex);
    }
};

const putRequest = async (url: string, req: NextApiRequest, res: NextApiResponse, accessToken: string | undefined, loggingContext: any) => {
    try {
        const data = getBodyParams(req);
        const result = await serverApi.put(url, data, { authorization: 'Bearer ' + accessToken }, loggingContext);
        sendRequest(req, res, result);
    } catch (ex: any) {
        sendError(res, ex);
    }
};

const deleteRequest = async (
    url: string,
    req: NextApiRequest,
    res: NextApiResponse,
    accessToken: string | undefined,
    loggingContext: any
) => {
    try {
        const result = await serverApi.delete(url, { authorization: 'Bearer ' + accessToken }, loggingContext);
        sendRequest(req, res, result);
    } catch (ex: any) {
        sendError(res, ex);
    }
};

export const requestHandler = async <T>(url: string, req: NextApiRequest, res: NextApiResponse, sanitizer?: SanitizerFn<any>) => {
    const userInfo = await getUserInfoForLogging(req, res);
    try {
        logTrace('server::requestHandler::handling request', {
            method: req.method,
            url,
            ...userInfo,
            file: 'server',
            function: 'requestHandler',
        });
        const accessToken = (await getAccessToken(req, res)).accessToken;
        console.log('🚀 ~ requestHandler ~ accessToken:', accessToken);

        try {
            if (req.method === 'PUT') return await putRequest(url, req, res, accessToken, { ...userInfo });
            if (req.method === 'GET') return await getRequest<T>(url, req, res, accessToken, { ...userInfo }, sanitizer);
            if (req.method === 'POST') return await postRequest<T>(url, req, res, accessToken, { ...userInfo }, sanitizer);
            if (req.method === 'DELETE') return await deleteRequest(url, req, res, accessToken, { ...userInfo });
        } catch (err) {
            logError(`server::requestHandler::error`, {
                method: req.method,
                url,
                ...parseErrorInformation(err),
                ...userInfo,
                file: 'server',
                function: 'requestHandler',
            });
            res.status(500).json({ err });
        }
    } catch (e: any) {
        logWarn('server::requestHandler::unauthorized', {
            ...parseErrorInformation(e),
            file: 'server',
            function: 'requestHandler',
            ...userInfo,
        });
        res.status(401).json({ err: e.code });
    }
};
