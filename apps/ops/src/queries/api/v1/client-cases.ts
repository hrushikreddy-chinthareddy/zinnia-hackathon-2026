import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import {
    IllustrationsClientCase,
    searchClientCaseQuery,
} from '@deps/types/illustrations';

const BASE_URL = `${baseAppUrl}/api/client-case-manager/v1/client-case`;

const buildQueryString = (queriesObject: object) => {
    return Object.entries(queriesObject)
        .filter(([, value]) => !!value)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
};

export const createClientCase = async (
    clientCaseData: Partial<IllustrationsClientCase>
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = (await client.post(BASE_URL, clientCaseData))
            .data as IllustrationsClientCase;
        return { data: response, error: null };
    } catch (error: any) {
        return error;
    }
};

export const patchClientCase = async (
    clientCaseData: Partial<IllustrationsClientCase>
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = await client.patch<
            Partial<IllustrationsClientCase>,
            AxiosResponse<IllustrationsClientCase>
        >(`${BASE_URL}/${clientCaseData.id}`, clientCaseData);

        return { data: response.data, error: null };
    } catch (error: any) {
        return error;
    }
};

export const searchClientCase = async (
    searchClientCaseQueries: searchClientCaseQuery
) => {
    const builtQueryParams = buildQueryString(searchClientCaseQueries);

    try {
        const request = client.get(`${BASE_URL}/search?${builtQueryParams}`);
        const response = await request;
        if (response.status === StatusCode.Okay) {
            return { data: response.data, error: null };
        } else {
            const error = new Error(response?.statusText);
            return {
                data: null,
                error: { ...error, status: response?.status || 500 },
            };
        }
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error
                    ? e
                    : new Error(
                          (e as Error)?.message ||
                              'an error occurred while retrieving products list'
                      )),
                status: 500,
            },
        };
    }
};

export const saveIllustrationToClientCase = async (
    clientCaseId: string,
    illustrationId: string,
    title: string,
    productType: string,
    productId: string,
    inputs: string,
    carrierCode: string
) => {
    try {
        const request = client.post(
            `${BASE_URL}/${clientCaseId}/illustrations`,
            {
                id: illustrationId,
                title,
                productType,
                productId,
                inputs,
                carrierCode,
            }
        );
        const response = await request;
        if (response.status === StatusCode.Okay) {
            return {
                data: { ...response.data, id: illustrationId },
                error: null,
            };
        } else {
            const error = new Error(response?.statusText);
            return {
                data: null,
                error: { ...error, status: response?.status || 500 },
            };
        }
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error
                    ? e
                    : new Error(
                          (e as Error)?.message ||
                              'an error occurred while saving illustration to client case'
                      )),
                status: 500,
            },
        };
    }
};

export const editIllustrationToClientCase = async (
    clientCaseId: string,
    oldIllustrationId: string,
    newIllustrationId: string,
    title: string,
    productType: string,
    productId: string,
    inputs: string
) => {
    try {
        const request = client.patch(
            `${BASE_URL}/${clientCaseId}/illustrations/${oldIllustrationId}`,
            { id: newIllustrationId, title, productType, productId, inputs }
        );
        const response = await request;
        if (response.status === StatusCode.Okay) {
            return {
                data: { ...response.data, id: newIllustrationId },
                error: null,
            };
        } else {
            const error = new Error(response?.statusText);
            return {
                data: null,
                error: { ...error, status: response?.status || 500 },
            };
        }
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error
                    ? e
                    : new Error(
                          (e as Error)?.message ||
                              'an error occurred while editing illustration on client case'
                      )),
                status: 500,
            },
        };
    }
};

export const selectIllustrationForApplication = async (
    clientCaseId: string,
    illustrationId: string
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = await client.patch<
            any,
            AxiosResponse<IllustrationsClientCase>
        >(`${BASE_URL}/${clientCaseId}/illustrations/${illustrationId}/submit`);

        return { data: response.data, error: null };
    } catch (error: any) {
        return error;
    }
};

export const archiveIllustration = async (
    clientCaseId: string,
    illustrationId: string
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = await client.patch<
            any,
            AxiosResponse<IllustrationsClientCase>
        >(
            `${BASE_URL}/${clientCaseId}/illustrations/${illustrationId}/archive`
        );

        return { data: response.data, error: null };
    } catch (error: any) {
        return error;
    }
};

export const unarchiveIllustration = async (
    clientCaseId: string,
    illustrationId: string
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = await client.patch<
            any,
            AxiosResponse<IllustrationsClientCase>
        >(
            `${BASE_URL}/${clientCaseId}/illustrations/${illustrationId}/reactivate`
        );

        return { data: response.data, error: null };
    } catch (error: any) {
        return error;
    }
};
