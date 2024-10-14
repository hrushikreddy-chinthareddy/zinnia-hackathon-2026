import { Claims, Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { AxiosError, AxiosResponse } from 'axios';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { UserProfile } from '@deps/models/user-profile';

import pino from './pino-server';

type UserInfo = {
    sessionId?: string;
    userId?: string;
    userName?: string;
};

type LoggingFunction = (message: string, serializableValues: any) => void;

type LoggingContext = UserInfo & {
    method: string | undefined;
    url: string | undefined;
    params?: Partial<{
        [key: string]: string | string[];
    }>;
    [key: string]: any;
};

type RouteHandlerWithLoggingContext = (
    ...args: [...Parameters<NextApiHandler>, ...[loggingContext: LoggingContext]]
) => ReturnType<NextApiHandler>;
export const withAuthAndLogging = (routeHandler: RouteHandlerWithLoggingContext, additionalContext: object = {}): NextApiHandler => {
    return withApiAuthRequired(async (req, res) => {
        const userInfo = await getUserInfoForLogging(req, res);
        const loggingContext: LoggingContext = {
            method: req.method,
            url: req.url,
            params: req.query || '',
            ...userInfo,
            ...additionalContext,
        };
        logTrace('next-server request made', loggingContext);
        return routeHandler(req, res, loggingContext);
    });
};

export const getUserInfoFromUser = (user: Claims | UserProfile | null | undefined) => {
    return { sessionId: user?.sid, userId: user?.sub, userName: user?.name, partyId: user?.partyId, email: user?.email };
};

export const getUserInfoFromSession = (session: Session | null | undefined) => {
    return { ...getUserInfoFromUser(session?.user) };
};
export const getUserInfoForLogging = async (req: NextApiRequest, res: NextApiResponse): Promise<UserInfo> => {
    try {
        const session = await getSession(req, res);
        return getUserInfoFromSession(session);
    } catch (error) {
        logWarn('getUserInfoForLogging:: error', {
            ...parseErrorInformation(error),
            file: 'utils/server-logging',
            function: 'getUserInfoForLogging',
        });
        return {};
    }
};

export const parseFailedNetworkRequest = (error?: AxiosResponse): object => {
    return {
        requestData: error?.data,
        requestHost: error?.request?.host,
        requestMethod: error?.request?.method,
        requestPath: error?.request?.path,
        requestStatus: error?.status,
        requestStatusText: error?.statusText,
        requestUrl: error?.request?.url,
    };
};

export const parseErrorInformation = (error?: any): object => {
    try {
        // The error is an Axios Error.  Parse the response to get the required fields.
        if ((error as AxiosError)?.response) {
            return parseFailedNetworkRequest(error.response);
        }
        // The error is an axios response from an axios error caught in our http client.  Parse the response to get the required fields.
        if ((error as AxiosResponse)?.data || (error as AxiosResponse)?.request) {
            return parseFailedNetworkRequest(error);
        }

        // This is a thrown Error.  Just return the message, omitting any call stack or extra shtuff
        if (error.message) {
            return { error: error.message };
        }

        return { error: 'could not parse error information' };
    } catch (e) {
        return { error: 'error parsing error information' };
    }
};

export const logCompliance: LoggingFunction = (message, serializableValues = {}) => {
    pino.compliance({ ...serializableValues, isCompliance: true }, message);
};

export const logFatal: LoggingFunction = (message, serializableValues = {}) => {
    pino.fatal(serializableValues, message);
};

export const logError: LoggingFunction = (message, serializableValues = {}) => {
    pino.error(serializableValues, message);
};

export const logWarn: LoggingFunction = (message, serializableValues = {}) => {
    pino.warn(serializableValues, message);
};

export const logInfo: LoggingFunction = (message, serializableValues = {}) => {
    pino.info(serializableValues, message);
};

export const logDebug: LoggingFunction = (message, serializableValues = {}) => {
    pino.debug(serializableValues, message);
};

export const logTrace: LoggingFunction = (message, serializableValues = {}) => {
    pino.trace(serializableValues, message);
};
