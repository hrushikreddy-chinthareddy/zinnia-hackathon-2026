import { AxiosResponse } from 'axios';

import { browserLogError } from '@deps/utils/browser-logging';
import {
    UserViewsInput,
    UserViewsOutput,
} from '@zinnia/api-types/types/analytics';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getUserViewsCounts = async (
    query: UserViewsInput
): Promise<UserViewsOutput> => {
    try {
        const { data: response } = await client.post<
            UserViewsInput,
            AxiosResponse<UserViewsOutput>
        >(`${baseAppUrl}/api/dashboard/user-views-count`, query);

        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        browserLogError(
            'getUserViewsCounts::An error occurred while getting user views results',
            error
        );

        throw error;
    }
};
