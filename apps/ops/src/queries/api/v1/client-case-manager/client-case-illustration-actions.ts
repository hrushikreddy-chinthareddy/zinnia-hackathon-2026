import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import { CLIENT_CASE_MANAGER_BASE_URL } from './constants';

export const selectIllustrationForApplication = async (
    clientCaseId: string,
    illustrationId: string
): Promise<ApiResponse<IllustrationsClientCase>> => {
    try {
        const response = await client.patch<
            any,
            AxiosResponse<IllustrationsClientCase>
        >(
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/${clientCaseId}/illustrations/${illustrationId}/submit`
        );

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
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/${clientCaseId}/illustrations/${illustrationId}/archive`
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
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/${clientCaseId}/illustrations/${illustrationId}/reactivate`
        );

        return { data: response.data, error: null };
    } catch (error: any) {
        return error;
    }
};
