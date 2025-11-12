import {
    HTTPValidationError,
    UserTransactionInput,
    UserTransactionOutput,
} from '@zinnia/api-types/types/analytics';
import { AxiosResponse } from 'axios';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getUserTransactionCounts = async (
    query: UserTransactionInput
): Promise<UserTransactionOutput> => {
    try {
        const { data: response } = await client.post<
            UserTransactionInput,
            AxiosResponse<UserTransactionOutput, HTTPValidationError>
        >(`${baseAppUrl}/api/dashboard/user-transaction-count`, query);
        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        console.error(
            'getUserTransactionCounts::An error occurred while getting user transaction results',
            error
        );
        if ('detail' in error) {
            return error.response;
        }
        return error;
    }
};
