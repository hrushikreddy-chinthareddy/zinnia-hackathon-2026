import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';
import { v4 as uuidV4 } from 'uuid';

import { logInfo, logTrace, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

export enum StatusCode {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    TooManyRequests = 429,
    InternalServerError = 500,
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

    private async addToken(axiosConfig?: AxiosAuthRequestConfig): Promise<AxiosRequestConfig> {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        const headers: any = {
            'x-correlation-id': uuidV4(),
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

    async get<T = any, R = AxiosResponse<T>>(url: string, config: AxiosAuthRequestConfig, logCtx?: any): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(config);
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

    async post<T = any, R = AxiosResponse<T>>(url: string, data: T, config: AxiosAuthRequestConfig, logCtx?: any): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(config);
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
            const result = await this.instance.post<T, R>(url, data, configWithToken);
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

    async put<T = any, R = AxiosResponse<T>>(url: string, data: T, config: AxiosAuthRequestConfig, logCtx?: any): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(config);
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
        logInfo('serverApiClient::put::authorization', {authorization : configWithToken?.headers?.Authorization ? true : false });
        try {
            const result = await this.instance.put<T, R>(url, data, configWithToken);
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

    async patch(url: string, config: AxiosAuthRequestConfig, logCtx?: any): Promise<any> {
        const now = performance.now();
        const configWithToken = await this.addToken(config);
        const correlationId = configWithToken.headers?.['x-correlation-id'];
        const loggingContext = {
            ...logCtx,
            file: 'serverApiClient',
            function: 'patch',
            method: 'PATCH',
            url,
            correlationId,
            ...config,
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

    async delete<T = any, R = AxiosResponse<T>>(url: string, config: AxiosAuthRequestConfig, logCtx?: any): Promise<R> {
        const now = performance.now();
        const configWithToken = await this.addToken(config);
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
            const result = await this.instance.delete<T, R>(url, configWithToken);
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
