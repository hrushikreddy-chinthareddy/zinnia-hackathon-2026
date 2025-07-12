import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { IllustrationsClientCase } from '@deps/types/illustrations';

export const getClientCaseById = async (
    clientCaseId: string
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const request = client.get<any, AxiosResponse<IllustrationsClientCase>>(
            `${baseAppUrl}/api/client-case-manager/v1/client-case/${clientCaseId}`
        );

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
                              'an error occurred while retrieving client case'
                      )),
                status: 500,
            },
        };
    }
};
