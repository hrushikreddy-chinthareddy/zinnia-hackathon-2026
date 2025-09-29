import { v4 as uuid4 } from 'uuid';

import { logError, LoggingContext, logTrace } from '@deps/utils/server-logging';

import {
    createProxyRequestHandler,
    CreateRequestHandlerOptions,
} from './api-proxy';
import { HttpRequest } from './http';

class EnterpriseTokenManager {
    private token: string | null = null;
    private tokenExp: number | null = null;

    async getToken(loggingCtx?: LoggingContext) {
        if (!this.token || !this.tokenExp || this.isTokenExpired()) {
            await this.refreshToken(loggingCtx);
        }

        return this.token;
    }

    /**
     *
     * @returns if a token exists and is expired
     */
    private isTokenExpired = () => {
        return !!this.tokenExp && Date.now() > this.tokenExp;
    };

    private async generateToken(): Promise<{
        access_token: string | null;
        expires_in: number | null;
    }> {
        const url = `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`;

        try {
            const authRes = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
                body: JSON.stringify({
                    grant_type: 'client_credentials',
                    client_id: process.env.AUTH0_CLIENT_ID,
                    client_secret: process.env.AUTH0_CLIENT_SECRET,
                    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
                }),
            });

            const parsedRes = await authRes.json();

            if (!authRes.ok) {
                logError('Error generating EnterpriseApiTokenHttp oauth token');
            }

            const expires = Date.now() + parsedRes.expires_in * 1000;

            return {
                access_token: parsedRes.access_token,
                expires_in: expires,
            };
        } catch (error) {
            throw new Error('oauth::generate Token Error::' + error);
        }
    }

    private async refreshToken(loggingCtx?: LoggingContext): Promise<void> {
        try {
            const { access_token, expires_in } = await this.generateToken();

            this.token = access_token;
            this.tokenExp = expires_in;
        } catch (e) {
            logError('EnterpriseApiTokenHttp::refreshToken::', loggingCtx);
        }
    }
}

/**
 * This class is used to hit endpoints that user specific tokens wouldn't have access to on the Zinnia API.
 * For instance, the fund information API. This uses the machine to machine auth token which
 * means that the machine (server) is communicating with the auth0 management api.
 * Read more [here](https://auth0.com/blog/using-m2m-authorization/)
 * Specifically: https://auth0.com/blog/using-m2m-authorization/#:~:text=The%20key%20aspect,don%27t%20make%20sense.
 *
 * WARNING: Use sparingly. This class should only be used if you need data that is not
 * provided by a user token.
 */
class EnterpriseTokenHttp extends HttpRequest {
    private tokenManager: EnterpriseTokenManager;

    constructor(tokenManager: EnterpriseTokenManager) {
        super();
        this.tokenManager = tokenManager;
    }

    public request = async (
        input: string | URL | Request,
        init?: RequestInit | undefined,
        loggingCtx?: LoggingContext
    ): Promise<Response> => {
        const token = await this.tokenManager.getToken();
        const correlationId = loggingCtx?.correlationId || uuid4();

        logTrace('enterprise-api-token-http::request::start', loggingCtx);

        const requestInit: RequestInit = init || {};

        if (!requestInit.headers) {
            requestInit.headers = {};
        }

        requestInit.headers = {
            'x-correlation-id': correlationId,
            ...requestInit.headers,
            credentials: 'include',
            Authorization: `Bearer ${token}`,
        };

        const result = await fetch(input, requestInit);

        logTrace('enterprise-api-token-http::request::complete', loggingCtx);

        return result;
    };
}

const enterpriseTokenManager = new EnterpriseTokenManager();

export const EnterpriseTokenApi = new EnterpriseTokenHttp(
    enterpriseTokenManager
);

export const createEnterpriseTokenRequestProxy = <T = Record<string, unknown>>(
    options: Omit<CreateRequestHandlerOptions<T>, 'getAuthToken'>
) =>
    createProxyRequestHandler({
        ...options,
        getAuthToken: () => enterpriseTokenManager.getToken(),
    });
