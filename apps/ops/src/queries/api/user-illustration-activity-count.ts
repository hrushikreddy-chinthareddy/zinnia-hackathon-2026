import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError } from '@deps/utils/browser-logging';
import {
    UserIllustrationActivityInput,
    UserIllustrationActivityOutput,
} from '@zinnia/api-types/types/analytics';

export const getUserIllustrationActivityCount = async (
    query: UserIllustrationActivityInput
): Promise<UserIllustrationActivityOutput> => {
    try {
        const { data: response } = await client.post<
            UserIllustrationActivityInput,
            AxiosResponse<UserIllustrationActivityOutput>
        >(
            `${baseAppUrl}/api/dashboard/user-illustration-activity-count`,
            query
        );

        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        browserLogError(
            'getUserIllustrationActivityCount::An error occurred while getting user illustrations activity count results',
            error
        );

        throw Error;
    }
};
