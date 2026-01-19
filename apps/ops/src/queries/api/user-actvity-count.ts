import { AxiosResponse } from 'axios';

import { browserLogError } from '@deps/utils/browser-logging';
import {
    UserActivityInput,
    UserActivityOutput,
} from '@zinnia/api-types/types/analytics';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getUserActivityCounts = async (
    query: UserActivityInput
): Promise<UserActivityOutput> => {
    try {
        const { data: response } = await client.post<
            UserActivityInput,
            AxiosResponse<UserActivityOutput>
        >(`${baseAppUrl}/api/dashboard/user-activity-count`, query);

        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        browserLogError(
            'getUserActivityCounts::An error occurred while getting user activity results',
            error
        );

        throw error;
    }
};
