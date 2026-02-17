import { AxiosResponse } from 'axios';
import { Jsonify } from 'type-fest';

import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import { CLIENT_CASE_MANAGER_BASE_URL } from './constants';
import { parseClientCase } from './parse-client-case';

export const createClientCase = async (
    clientCaseData: Partial<IllustrationsClientCase>
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = (
            await client.post<
                Partial<IllustrationsClientCase>,
                AxiosResponse<Jsonify<IllustrationsClientCase>>
            >(`${CLIENT_CASE_MANAGER_BASE_URL}/client-case`, clientCaseData)
        ).data;
        return { data: parseClientCase(response), error: null };
    } catch (error: any) {
        return error;
    }
};
