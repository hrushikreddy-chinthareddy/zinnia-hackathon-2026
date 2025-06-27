import {
    Claims,
    Session,
    WithPageAuthRequired,
    WithPageAuthRequiredOptions,
    getSession,
    withApiAuthRequired,
    withPageAuthRequired,
} from '@auth0/nextjs-auth0';
import { AxiosError, AxiosResponse } from 'axios';
import {
    GetServerSideProps,
    GetServerSidePropsContext,
    NextApiHandler,
    NextApiRequest,
    NextApiResponse,
} from 'next';
import { v4 as uuidV4 } from 'uuid';

import { UserProfile } from '@deps/models/user-profile';

import pino, { complianceLogger } from './pino-server';

type UserInfo = {
    sessionId: string;
    partyId: string;
    userName: string;
};

type LoggingFunction = (
    message: string,
    serializableValues?: LoggingContext
) => void;

export type APIErrorInformation = {
    requestData?: any;
    requestHost?: string;
    requestMethod?: string;
    requestPath?: string;
    requestStatus?: string | number;
    requestStatusText?: string;
    requestUrl?: string;
};

export type MinimumRequiredErrorInformation = {
    error: string;
    [key: string]: any;
};

type AdditionalContext = {
    file: string;
    function: string;
    [key: string]: any;
};

export type LoggingContext = {
    correlationId: string; // the correlationId passed as x-correlation-id in the header of a request to the gateway
    inputs:
        | {
              // request body
              [key: string]: any;
          }
        | undefined;
    file: string; // what file you're calling this from
    function: string; // what function/method you're calling this from
    method: string | undefined; // http verb
    page: string | undefined; // the page for page views,
    params: Partial<{ [key: string]: string | string[] }> | undefined; // query params of the page for page views, request params for api requests
    referrer: string | undefined; // the referer for page views and api requests
    url: string | undefined; // the request URL for api requests, undefined for page views
    user: UserInfo | undefined;
    [key: string]: any; // any other values
};

type RouteHandlerWithLoggingContext = (
    ...args: [
        ...Parameters<NextApiHandler>,
        ...[loggingContext: LoggingContext]
    ]
) => ReturnType<NextApiHandler>;

// Define the type for the wrapped getServerSideProps function
export type GetServerSidePropsWithLoggingContext = (
    ...args: [
        ...Parameters<GetServerSideProps>,
        ...[loggingContext: LoggingContext]
    ]
) => ReturnType<GetServerSideProps>;

// Define the type for the wrapper function
type WithPageAuthAndLogging = (
    opts: Omit<WithPageAuthRequiredOptions, 'getServerSideProps'> & {
        getServerSideProps: GetServerSidePropsWithLoggingContext;
    },
    loggingContext: {
        file: string;
        function: string;
        page: string;
        [key: string]: any;
    }
) => ReturnType<WithPageAuthRequired>;

export const logCompliance: LoggingFunction = (message, serializableValues) => {
    complianceLogger.compliance(
        { ...(serializableValues || {}), isCompliance: true },
        message
    );
};

export const logFatal: LoggingFunction = (message, serializableValues) => {
    pino.fatal(serializableValues || {}, message);
};

export const logError: LoggingFunction = (message, serializableValues) => {
    pino.error(serializableValues || {}, message);
};

export const logWarn: LoggingFunction = (message, serializableValues) => {
    pino.warn(serializableValues || {}, message);
};

export const logInfo: LoggingFunction = (message, serializableValues) => {
    pino.info(serializableValues || {}, message);
};

export const logDebug: LoggingFunction = (message, serializableValues) => {
    pino.debug(serializableValues || {}, message);
};

export const logTrace: LoggingFunction = (message, serializableValues) => {
    pino.trace(serializableValues || {}, message);
};

// TRY NOT TO USE THIS! Error without context are much less valuable than errors with context
export const logErrorWithoutContext = (
    message: string,
    serializableValues?: any
) => {
    pino.error(serializableValues || {}, message);
};

export const parseFailedNetworkRequest = (
    error?: AxiosResponse
): APIErrorInformation => {
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

export const parseErrorInformation = (
    error?: any
): APIErrorInformation | MinimumRequiredErrorInformation => {
    try {
        // The error is an Axios Error.  Parse the response to get the required fields.
        if ((error as AxiosError)?.response) {
            return parseFailedNetworkRequest(error.response);
        }
        // The error is an axios response from an axios error caught in our http client.  Parse the response to get the required fields.
        if (
            (error as AxiosResponse)?.data ||
            (error as AxiosResponse)?.request
        ) {
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

const getContextFromRequest = (
    req: NextApiRequest
): Pick<
    LoggingContext,
    'method' | 'url' | 'inputs' | 'page' | 'params' | 'referrer'
> => {
    if (!req) {
        return {
            method: '',
            url: '',
            inputs: undefined,
            page: '',
            params: undefined,
            referrer: undefined,
        };
    }
    return {
        method: req.method || 'GET',
        url: req.url,
        params: req.query,
        inputs: req.body,
        page: undefined,
        referrer: req.headers.referer || '',
    };
};

export const getUserInfoFromUser = (
    user: Claims | UserProfile | null | undefined
) => {
    return {
        sessionId: user?.sid,
        userId: user?.sub,
        userName: user?.name,
        partyId: user?.partyId,
        email: user?.email,
    };
};

export const getUserInfoFromSession = (session: Session | null | undefined) => {
    return { ...getUserInfoFromUser(session?.user) };
};
export const getUserInfoForLogging = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<UserInfo | undefined> => {
    try {
        const session = await getSession(req, res);
        return getUserInfoFromSession(session);
    } catch (error) {
        pino.warn('getUserInfoForLogging:: error', {
            ...parseErrorInformation(error),
            ...getContextFromRequest(req),
            file: 'utils/server-logging',
            function: 'getUserInfoForLogging',
            user: undefined,
        });
        return undefined;
    }
};

export const buildNextApiLoggingContext = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<Omit<LoggingContext, 'file' | 'function'>> => {
    const userInfo = await getUserInfoForLogging(req, res);
    return {
        ...getContextFromRequest(req),
        user: userInfo,
    };
};
export const buildNextPageLoggingContext = async (
    context: GetServerSidePropsContext,
    page: string,
    file: string,
    func: string
): Promise<LoggingContext> => {
    try {
        const session = await getSession(context.req, context.res);
        const userInfo = getUserInfoFromSession(session);
        const { req, query, params } = context;
        return {
            method: req.method || 'GET',
            url: req.url,
            params,
            inputs: query,
            page,
            referrer: req.headers.referer || '',
            file,
            function: func,
            user: userInfo,
            correlationId:
                req?.headers?.['x-correlation-id']?.toString() ||
                query?.correlationId?.toString() ||
                uuidV4(),
        };
    } catch (error) {
        pino.warn('buildNextPageLoggingContext:: error', {
            ...parseErrorInformation(error),
        });
        return {
            correlationId:
                context?.req?.headers?.['x-correlation-id']?.toString() ||
                context?.query?.correlationId?.toString() ||
                uuidV4(),
            method: '',
            url: '',
            params: undefined,
            inputs: undefined,
            page: '',
            referrer: '',
            file: '',
            function: '',
            user: undefined,
        };
    }
};

// Wrapper method to provide logging context to route handlers
export const withAuthAndLogging = (
    routeHandler: RouteHandlerWithLoggingContext,
    additionalContext: AdditionalContext
): NextApiHandler => {
    return withApiAuthRequired(async (req, res) => {
        // Try and find a correlation id in the request.  Otherwise, generate one
        const correlationId =
            additionalContext?.correlationId ||
            req?.body?.correlationId ||
            req?.headers?.['x-correlation-id'] ||
            req?.query?.correlationId ||
            uuidV4();

        const baseContext = await buildNextApiLoggingContext(req, res);
        const loggingContext = {
            correlationId: correlationId,
            ...baseContext,
            ...additionalContext,
        } as unknown as LoggingContext; // Casting to LoggingContext as ts is confused by the omit joining with additionalContext

        logTrace('next-server request made', loggingContext);
        return routeHandler(req, res, loggingContext);
    });
};

// Wrapper method to provide logging context to getServerSideProps on page views
export const withPageAuthAndLogging: WithPageAuthAndLogging = (
    options,
    logCtx
) => {
    const { getServerSideProps, ...otherOptions } = options;
    return withPageAuthRequired({
        ...otherOptions,
        getServerSideProps: async (context) => {
            const { page, file, function: func } = logCtx;
            const loggingContext = await buildNextPageLoggingContext(
                context,
                page,
                file,
                func
            );
            logTrace('next-server page view', loggingContext);
            return getServerSideProps(context, loggingContext);
        },
    });
};
