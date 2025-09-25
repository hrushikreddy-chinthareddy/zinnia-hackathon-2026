import { ApiGetProducerResponse } from '@xd/pom/src/types/get.types';
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
        // hit our route handler which uses the enterprise token api
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
        // hit our route handler which uses the enterprise token api
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

export const getProducersByNameAndCarrier = async (
    partialFullName: string,
    carrierShortName: string
) => {
    try {
        // hit our route handler which uses the enterprise token api
        const request = client.get(
            `${baseAppUrl}/api/distributors/v1/producers/producers?partialFullName=${partialFullName}&carrierShortName=${carrierShortName}`
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

export const getProducerById = async (id: string) => {
    try {
        // carrierShortName query param should be replaced in the future, we are adding this as a temporal solution.
        const request = client.get<any, AxiosResponse<ApiGetProducerResponse>>(
            `${baseAppUrl}/api/distributors/v1/producers/${id}?carrierShortName=FNWL`
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
