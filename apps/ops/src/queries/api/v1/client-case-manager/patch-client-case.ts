import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { IllustrationsClientCase } from '@deps/types/illustrations';

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
    } catch (error: any) {
        return error;
    }
};
