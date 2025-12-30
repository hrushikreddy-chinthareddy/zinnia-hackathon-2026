import {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
} from 'next';
import { ParsedUrlQuery } from 'querystring';

import logger from './pino-server';
import {
    logError,
    logWarn,
    logInfo,
    logTrace,
    logCompliance,
    LoggingContext,
    logErrorWithoutContext,
    withAuthAndLogging,
    withPageAuthAndLogging,
} from './server-logging';

jest.mock('@deps/utils/pino-server', () => {
    return {
        __esModule: true,
        default: {
            trace: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            compliance: jest.fn(),
        },
    };
});
jest.mock('@auth0/nextjs-auth0', () => ({
    getSession: jest.fn(() => ({
        user: {
            sid: 'sid',
            sub: 'sub',
            name: 'name',
            email: 'email',
            partyId: 'partyId',
        },
    })),
    withApiAuthRequired: jest.fn((handler) => handler),
    withPageAuthRequired: jest.fn((options) => options),
}));
jest.mock('uuid', () => ({ v4: jest.fn(() => 'uuid') }));

const mockLoggingContext: LoggingContext = {
    method: 'GET',
    url: 'url',
    params: undefined,
    inputs: undefined,
    page: undefined,
    referrer: 'referrer',
    correlationId: '',
    file: 'mockFile',
    function: 'mockFunction',
    user: { sessionId: 'sid', userName: 'name', partyId: 'partyId' },
};

describe('server-logging', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('logError', () => {
        it('should use the appropriate pino method to log', () => {
            logError('error', mockLoggingContext);
            expect(logger.error).toHaveBeenCalledWith(
                mockLoggingContext,
                'error'
            );
        });
    });
    describe('logWarn', () => {
        it('should use the appropriate pino method to log', () => {
            logWarn('warn', mockLoggingContext);
            expect(logger.warn).toHaveBeenCalledWith(
                mockLoggingContext,
                'warn'
            );
        });
    });
    describe('logInfo', () => {
        it('should use the appropriate pino method to log', () => {
            logInfo('info', mockLoggingContext);
            expect(logger.info).toHaveBeenCalledWith(
                mockLoggingContext,
                'info'
            );
        });
    });
    describe('logTrace', () => {
        it('should use the appropriate pino method to log', () => {
            logTrace('trace', mockLoggingContext);
            expect(logger.trace).toHaveBeenCalledWith(
                mockLoggingContext,
                'trace'
            );
        });
    });
    describe('logCompliance', () => {
        it('should use the appropriate pino method to log and attach isCompliance: true', () => {
            logCompliance('trace', mockLoggingContext);
            expect(logger.info).toHaveBeenCalled();
            expect(
                (logger.info as jest.Mock).mock.calls[0][0].isCompliance
            ).toBe(true);
        });
    });
    describe('logErrorWithoutContext', () => {
        it('should use the appropriate pino method to log', () => {
            logErrorWithoutContext('error', mockLoggingContext);
            expect(logger.error).toHaveBeenCalledWith(
                mockLoggingContext,
                'error'
            );
        });
    });

    describe('withAuthAndLogging', () => {
        const nextApiReq = {
            query: {},
            body: {},
            headers: {},
            method: 'GET',
            url: 'url',
        } as NextApiRequest;
        const nextApiRes = {} as NextApiResponse;

        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('should accept a routehandler and context, passing context to the handler', async () => {
            const handler = jest.fn();
            const context = {
                additionalDetails: 'blah',
                file: 'testFile',
                function: 'testFunction',
            };
            await withAuthAndLogging(handler, context)(nextApiReq, nextApiRes);
            expect(handler).toHaveBeenCalled();
            expect(handler.mock.calls[0][0]).toEqual(nextApiReq);
            expect(handler.mock.calls[0][1]).toEqual(nextApiRes);
            expect(handler.mock.calls[0][2].additionalDetails).toEqual('blah');
            expect(handler.mock.calls[0][2].file).toEqual('testFile');
            expect(handler.mock.calls[0][2].function).toEqual('testFunction');
            expect(handler.mock.calls[0][2].user).toEqual({
                sessionId: 'sid',
                userName: 'name',
                partyId: 'partyId',
                userId: 'sub',
                email: 'email',
            });
            expect(handler.mock.calls[0][2].correlationId).toEqual('uuid');
            expect(logger.trace).toHaveBeenCalled();
        });

        it('should use a correlationId from the request body if present', async () => {
            const handler = jest.fn();
            const context = {
                additionalDetails: 'blah',
                file: 'testFile',
                function: 'testFunction',
            };
            const mockReq = {
                ...nextApiReq,
                body: { correlationId: 'newUuid' },
            } as NextApiRequest;
            await withAuthAndLogging(handler, context)(mockReq, nextApiRes);
            expect(handler.mock.calls[0][2].correlationId).toEqual('newUuid');
        });
        it('should use a correlationId from additionalContext if present', async () => {
            const handler = jest.fn();
            const context = {
                additionalDetails: 'blah',
                file: 'testFile',
                function: 'testFunction',
                correlationId: 'newNewUuid',
            };
            await withAuthAndLogging(handler, context)(nextApiReq, nextApiRes);
            expect(handler.mock.calls[0][2].correlationId).toEqual(
                'newNewUuid'
            );
        });
    });

    describe('withPageAuthAndLogging', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        const context = {
            req: {
                method: 'GET',
                url: 'url',
                headers: {
                    referer: 'referer',
                },
            },
            query: { queryValue: 'queryValue' } as ParsedUrlQuery,
            params: { paramsValue: 'paramsValue' } as ParsedUrlQuery,
        } as GetServerSidePropsContext;
        it('should accept a getServerSideProps and context, passing the context into getServerSideProps', async () => {
            const handler = jest.fn();
            const options = {
                getServerSideProps: handler,
            };
            const wpaalOptions = await withPageAuthAndLogging(options, {
                file: 'testFile',
                function: 'testFunction',
                page: 'testPage',
            });

            // @ts-expect-error: Property 'getServerSideProps' does not exist on type 'PageRoute<{ [key: string]: any; }, ParsedUrlQuery>'
            await wpaalOptions.getServerSideProps(context);

            expect(handler).toHaveBeenCalled();
            expect(handler.mock.calls[0][0]).toEqual(context);
            expect(handler.mock.calls[0][1].page).toEqual('testPage');
            expect(handler.mock.calls[0][1].file).toEqual('testFile');
            expect(handler.mock.calls[0][1].function).toEqual('testFunction');
            expect(handler.mock.calls[0][1].user).toEqual({
                sessionId: 'sid',
                userName: 'name',
                partyId: 'partyId',
                userId: 'sub',
                email: 'email',
            });
            expect(handler.mock.calls[0][1].correlationId).toEqual('uuid');
            expect(logger.trace).toHaveBeenCalled();
        });
    });
});
