import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { setCookie } from 'cookies-next';
import https from 'https';

export enum StatusCode {
    Okay = 200,
    Accepted = 202,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    TooManyRequests = 429,
    InternalServerError = 500,
}
export interface TokenRequestBody {
    client_id: string;
    grant_type: string;
    refresh_token?: string;
    client_secret?: string;
    audience?: string;
}

export interface AxiosAuthRequestConfig extends AxiosRequestConfig {
    token?: string;
    authorization?: string;
}

export abstract class Http {
    private instance: AxiosInstance;

    constructor() {
        this.instance = this.initHttp();
    }

    private async addToken(
        axiosConfig?: AxiosAuthRequestConfig
    ): Promise<AxiosRequestConfig> {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        const headers: any = {
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
        config: AxiosAuthRequestConfig
    ): Promise<R> {
        const configWithToken = await this.addToken(config);
        return this.instance.request<T, R>(configWithToken);
    }

    async get<T = any, R = AxiosResponse<T>>(
        url: string,
        config?: AxiosAuthRequestConfig
    ): Promise<R> {
        const configWithToken = await this.addToken(config);
        return await this.instance.get<T, R>(url, configWithToken);
    }

    async post<T = any, R = AxiosResponse<T>>(
        url: string,
        data?: T,
        config?: AxiosAuthRequestConfig
    ): Promise<R> {
        const configWithToken = await this.addToken(config);

        return await this.instance.post<T, R>(url, data, configWithToken);
    }

    async put<T = any, R = AxiosResponse<T>>(
        url: string,
        data?: T,
        config?: AxiosAuthRequestConfig
    ): Promise<R> {
        const configWithToken = await this.addToken(config);
        return await this.instance.put<T, R>(url, data, configWithToken);
    }

    async patch<T = any, R = AxiosResponse<T>>(
        url: string,
        config?: AxiosAuthRequestConfig
    ): Promise<R> {
        const configWithToken = await this.addToken(config);
        return await this.instance.patch<T, R>(url, configWithToken);
    }

    async delete<T = any, R = AxiosResponse<T>>(
        url: string,
        config?: AxiosAuthRequestConfig
    ): Promise<R> {
        const configWithToken = await this.addToken(config);
        return this.instance.delete<T, R>(url, configWithToken);
    }

    private initHttp() {
        const http = axios.create({});

        http.interceptors.response.use(
            (response) => response,
            (error) => {
                const { response } = error;
                return this.handleError(response);
            }
        );

        return http;
    }

    protected async handleError(error: any) {
        const status = error?.status;

        switch (status) {
            case StatusCode.InternalServerError: {
                console.log(error);
                break;
            }
            case StatusCode.Forbidden: {
                console.log('FORBIDDEN', error);
                break;
            }
            case StatusCode.Unauthorized: {
                console.log('UNAUTHORIZED', error);
                setCookie('zlSessionTimeout', true, {
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
                if (window) {
                    window.location.href = '/api/auth/logout';
                }
                break;
            }
            case StatusCode.BadRequest: {
                console.log('BAD REQUEST', error);

                break;
            }
            case StatusCode.TooManyRequests: {
                break;
            }
        }

        throw error;
    }
}
