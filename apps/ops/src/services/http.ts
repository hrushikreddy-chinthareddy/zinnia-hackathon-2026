import { LoggingContext } from '@deps/utils/server-logging';

export abstract class HttpRequest {
    abstract request: (
        input: string | URL | Request,
        init?: RequestInit | undefined,
        loggingCtx?: LoggingContext
    ) => Promise<Response>;

    get = (
        input: string | URL | Request,
        init?: RequestInit | undefined,
        loggingCtx?: LoggingContext
    ) => {
        init = init || {};
        init.method = 'GET';
        return this.request(input, init, loggingCtx);
    };

    post = (
        input: string | URL | Request,
        data?: BodyInit | null | undefined,
        init?: RequestInit | undefined,
        loggingCtx?: LoggingContext
    ) => {
        init = init || {};
        init.method = 'POST';
        init.body = data;
        return this.request(input, init, loggingCtx);
    };

    put = (
        input: string | URL | Request,
        data?: BodyInit | null | undefined,
        init?: RequestInit | undefined,
        loggingCtx?: LoggingContext
    ) => {
        init = init || {};
        init.method = 'PUT';
        init.body = data;
        return this.request(input, init, loggingCtx);
    };

    patch = (
        input: string | URL | Request,
        data?: BodyInit | null | undefined,
        init?: RequestInit | undefined,
        loggingCtx?: LoggingContext
    ) => {
        init = init || {};
        init.method = 'PATCH';
        init.body = data;
        return this.request(input, init, loggingCtx);
    };
}
