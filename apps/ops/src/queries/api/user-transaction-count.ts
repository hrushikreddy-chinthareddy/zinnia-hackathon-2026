import { AxiosResponse } from 'axios';

import { browserLogError } from '@deps/utils/browser-logging';
import {
    HttpValidationError,
    UserTransactionInput,
    UserTransactionOutput,
} from '@zinnia/api-types/types/analytics';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getUserTransactionCounts = async (
    query: UserTransactionInput
): Promise<UserTransactionOutput> => {
    try {
        const { data: response } = await client.post<
            UserTransactionInput,
            AxiosResponse<UserTransactionOutput, HttpValidationError>
        >(`${baseAppUrl}/api/dashboard/user-transaction-count`, query);
        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        browserLogError(
            'getUserTransactionCounts::An error occurred while getting user transaction results',
            error
        );

        throw error;
    }
};
