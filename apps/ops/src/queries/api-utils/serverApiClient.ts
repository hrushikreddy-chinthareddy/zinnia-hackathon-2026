import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';
import { v4 as uuidV4 } from 'uuid';

import {
    LoggingContext,
    logInfo,
    logTrace,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

export enum StatusCode {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    TooManyRequests = 429,
    InternalServerError = 500,
    OK = 200,
}

export interface AxiosAuthRequestConfig extends AxiosRequestConfig {
    token?: string;
    authorization?: string;
}

export abstract class ServerApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = this.initHttp();
    }

    private async addToken(
        axiosConfig: AxiosAuthRequestConfig = {},
        correlationId?: string
    ): Promise<AxiosRequestConfig> {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        const headers: any = {
            'x-correlation-id': correlationId || uuidV4(),
            ...axiosConfig?.headers,
            Authorization: axiosConfig?.authorization,
        };

        return {
            ...axiosConfig,
            withCredentials: false,
            httpsAgent: agent,
            headers,
        };
    }

    async request<T = any, R = AxiosResponse<T>>(
        config: AxiosAuthRequestConfig,
        logCtx: LoggingContext
    ) {
        const now = performance.now();
        const configWithToken = await this.addToken(
            config,
            logCtx?.correlationId
        );
        const correlationId = configWithToken.headers?.['x-correlation-id'];

        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'request',
            method: config.method,
            url: config.url,
            correlationId,
        };
        logTrace('serverApiClient::request', loggingContext);
        try {
            const result = await this.instance.request<T, R>(configWithToken);
            logTrace('serverApiClient::request::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return result;
        } catch (ex: any) {
            logWarn('serverApiClient::request::error', {
                ...loggingContext,
                ...parseErrorInformation(ex),
                duration: performance.now() - now,
            });
            throw ex?.response ?? ex;
        }
    }

    async get<T = any, R = AxiosResponse<T>>(
        url: string,
        config: AxiosAuthRequestConfig,
        logCtx: LoggingContext
    ): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(
            config,
            logCtx?.correlationId
        );
        const correlationId = configWithToken.headers?.['x-correlation-id'];
        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'get',
            method: 'GET',
            url,
            correlationId,
        };
        logTrace('serverApiClient::get', loggingContext);

        try {
            const result = await this.instance.get<T, R>(url, configWithToken);
            logTrace('serverApiClient::get::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return result;
        } catch (ex: any) {
            logWarn('serverApiClient::get::error', {
                ...loggingContext,
                ...parseErrorInformation(ex),
                duration: performance.now() - now,
            });
            throw ex?.response ?? ex;
        }
    }

    async post<T = any, R = AxiosResponse<T>>(
        url: string,
        data: T,
        config: AxiosAuthRequestConfig,
        logCtx: LoggingContext
    ): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(
            config,
            logCtx?.correlationId
        );
        const correlationId = configWithToken.headers?.['x-correlation-id'];

        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'post',
            method: 'POST',
            url,
            correlationId,
        };
        logTrace('serverApiClient::post', loggingContext);
        try {
            const result = await this.instance.post<T, R>(
                url,
                data,
                configWithToken
            );
            logTrace('serverApiClient::post::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return result;
        } catch (ex: any) {
            logWarn('serverApiClient::post::error', {
                ...loggingContext,
                ...parseErrorInformation(ex),
                duration: performance.now() - now,
            });
            throw ex?.response ?? ex;
        }
    }

    async put<T = any, R = AxiosResponse<T>>(
        url: string,
        data: T,
        config: AxiosAuthRequestConfig,
        logCtx: LoggingContext
    ): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(
            config,
            logCtx?.correlationId
        );
        const correlationId = configWithToken.headers?.['x-correlation-id'];
        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'put',
            method: 'PUT',
            url,
            correlationId,
        };
        logTrace('serverApiClient::put', loggingContext);
        logInfo('serverApiClient::put::authorization', {
            ...loggingContext,
            isAuthorized: configWithToken?.headers?.Authorization
                ? true
                : false,
        });
        try {
            const result = await this.instance.put<T, R>(
                url,
                data,
                configWithToken
            );
            logTrace('serverApiClient::put::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return result;
        } catch (ex: any) {
            logWarn('serverApiClient::put::error', {
                ...loggingContext,
                ...parseErrorInformation(ex),
                duration: performance.now() - now,
            });
            throw ex?.response ?? ex;
        }
    }

    // TODO: needs reviewed and refactored if it's used as a GET. cc Alex W.
    async patch(
        url: string,
        config: AxiosAuthRequestConfig,
        logCtx: LoggingContext
    ): Promise<any> {
        const now = performance.now();
        const configWithToken = await this.addToken(
            config,
            logCtx?.correlationId
        );
        const correlationId = configWithToken.headers?.['x-correlation-id'];
        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'patch',
            method: 'PATCH',
            url,
            correlationId,
        };
        logTrace('serverApiClient::patch', loggingContext);
        try {
            const result = await fetch(url, loggingContext);
            logTrace('serverApiClient::patch::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return result;
        } catch (ex: any) {
            logWarn('serverApiClient::patch::error', {
                ...loggingContext,
                ...parseErrorInformation(ex),
                duration: performance.now() - now,
            });
            throw ex?.response ?? ex;
        }
    }

    async realPatch<T = any, R = AxiosResponse<T>>(
        url: string,
        data: T,
        config: AxiosAuthRequestConfig,
        logCtx: LoggingContext
    ): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(
            config,
            logCtx?.correlationId
        );
        const correlationId = configWithToken.headers?.['x-correlation-id'];
        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'patch',
            method: 'PATCH',
            url,
            correlationId,
        };
        logTrace('serverApiClient::patch', loggingContext);
        logInfo('serverApiClient::patch::authorization', {
            ...loggingContext,
            isAuthorized: configWithToken?.headers?.Authorization
                ? true
                : false,
        });
        try {
            const result = await this.instance.patch<T, R>(
                url,
                data,
                configWithToken
            );
            logTrace('serverApiClient::patch::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return result;
        } catch (ex: any) {
            logWarn('serverApiClient::patch::error', {
                ...loggingContext,
                ...parseErrorInformation(ex),
                duration: performance.now() - now,
            });
            throw ex?.response ?? ex;
        }
    }

    async delete<T = any, R = AxiosResponse<T>>(
        url: string,
        config: AxiosAuthRequestConfig,
        logCtx: LoggingContext
    ): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(
            config,
            logCtx?.correlationId
        );
        const correlationId = configWithToken.headers?.['x-correlation-id'];
        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'delete',
            method: 'DELETE',
            url,
            correlationId,
        };
        logTrace('serverApiClient::delete', loggingContext);

        try {
            const result = await this.instance.delete<T, R>(
                url,
                configWithToken
            );
            logTrace('serverApiClient::delete::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return result;
        } catch (ex: any) {
            logWarn('serverApiClient::delete::error', {
                ...loggingContext,
                ...parseErrorInformation(ex),
                duration: performance.now() - now,
            });
            throw ex?.response ?? ex;
        }
    }

    private initHttp() {
        const http = axios.create({});

        return http;
    }
}

class ApiHttp extends ServerApiClient {}

export const serverApi = new ApiHttp();
