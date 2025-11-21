import {
    UserIllustrationActivityInput,
    UserIllustrationActivityOutput,
    HTTPValidationError,
} from '@zinnia/api-types/types/analytics';
import { AxiosResponse } from 'axios';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getUserIllustrationActivityCount = async (
    query: UserIllustrationActivityInput
): Promise<UserIllustrationActivityOutput> => {
    try {
        const { data: response } = await client.post<
            UserIllustrationActivityInput,
            AxiosResponse<UserIllustrationActivityOutput, HTTPValidationError>
        >(
            `${baseAppUrl}/api/dashboard/user-illustration-activity-count`,
            query
        );

        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        console.error(
            'getUserIllustrationActivityCount::An error occurred while getting user illustrations activity count results',
            error
        );
        if ('detail' in error) {
            return error.response;
        }
        return error;
    }
};
