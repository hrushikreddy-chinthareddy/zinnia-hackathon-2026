import {
    UserViewsInput,
    UserViewsOutput,
    HTTPValidationError,
} from '@zinnia/api-types/types/analytics';
import { AxiosResponse } from 'axios';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getUserViewsCounts = async (
    query: UserViewsInput
): Promise<UserViewsOutput> => {
    try {
        const { data: response } = await client.post<
            UserViewsInput,
            AxiosResponse<UserViewsOutput, HTTPValidationError>
        >(`${baseAppUrl}/api/dashboard/user-views-count`, query);

        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        console.error(
            'getUserViewsCounts::An error occurred while getting user views results',
            error
        );
        if ('detail' in error) {
            return error.response;
        }
        return error;
    }
};
