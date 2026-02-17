import { AxiosResponse } from 'axios';
import { Jsonify } from 'type-fest';

import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import { CLIENT_CASE_MANAGER_BASE_URL } from './constants';
import { parseClientCase } from './parse-client-case';

export const getClientCaseById = async (
    clientCaseId: string
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const request = client.get<
            any,
            AxiosResponse<Jsonify<IllustrationsClientCase>>
        >(`${CLIENT_CASE_MANAGER_BASE_URL}/client-case/${clientCaseId}`);

        const response = await request;
        if (response.status === StatusCode.Okay) {
            return { data: parseClientCase(response.data), error: null };
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
