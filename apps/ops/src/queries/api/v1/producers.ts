import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import {
    GetDownlineResponse,
    GetHierarchyResponse,
} from '@deps/types/producers';

export const getHierarchyBySellingCode = async (
    sellingCode: string
): Promise<ApiResponse<GetHierarchyResponse>> => {
    try {
        const request = client.get<any, AxiosResponse<GetHierarchyResponse>>(
            `${baseAppUrl}/api/distributors/v1/hierarchies/selling-code/${sellingCode}`
        );

        const response = await request;
        if (response.status === StatusCode.Okay) {
            return { data: response.data, error: null };
        }

        const error = new Error(response?.statusText);
        return {
            data: null,
            error: { ...error, status: response?.status || 500 },
        };
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error
                    ? e
                    : new Error(
                          (e as Error)?.message ||
                              'an error occurred while retrieving hierarchy'
                      )),
                status: 500,
            },
        };
    }
};

export const getDownlineBySellingCode = async (
    sellingCode: string,
    partialFullName: string
) => {
    try {
        const request = client.get<any, AxiosResponse<GetDownlineResponse[][]>>(
            `${baseAppUrl}/api/distributors/v1/hierarchies/selling-code/${sellingCode}/downline?partialFullName=${partialFullName}`
        );
        const response = await request;
        if (response.status === StatusCode.Okay) {
            return { data: response.data, error: null };
        }
        const error = new Error(response?.statusText);
        return {
            data: null,
            error: { ...error, status: response?.status || 500 },
        };
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error
                    ? e
                    : new Error(
                          (e as Error)?.message ||
                              'an error occurred while retrieving hierarchy'
                      )),
                status: 500,
            },
        };
    }
};
