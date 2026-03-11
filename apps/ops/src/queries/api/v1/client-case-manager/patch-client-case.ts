import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { browserLogError } from '@deps/utils/browser-logging';

import { CLIENT_CASE_MANAGER_BASE_URL } from './constants';

export const patchClientCase = async (
    clientCaseData: Partial<IllustrationsClientCase>
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = await client.patch<
            Partial<IllustrationsClientCase>,
            AxiosResponse<IllustrationsClientCase>
        >(
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/${clientCaseData.id}`,
            clientCaseData
        );

        return { data: response.data, error: null };
    } catch (error: unknown) {
        if (error instanceof Object && 'data' in error) {
            const { data, status } = error as AxiosResponse;
            if (status >= 500) {
                browserLogError('Failed client case patch', data);
            }
        }
        throw error;
    }
};
