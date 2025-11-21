import { AxiosResponse } from 'axios';

import {
    UserActivityInput,
    UserActivityOutput,
    HTTPValidationError,
} from '@zinnia/api-types/types/analytics';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getUserActivityCounts = async (
    query: UserActivityInput
): Promise<UserActivityOutput> => {
    try {
        const { data: response } = await client.post<
            UserActivityInput,
            AxiosResponse<UserActivityOutput, HTTPValidationError>
        >(`${baseAppUrl}/api/dashboard/user-activity-count`, query);

        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        console.error(
            'getUserActivityCounts::An error occurred while getting user activity results',
            error
        );
        if ('detail' in error) {
            return error.response;
        }
        return error;
    }
};
