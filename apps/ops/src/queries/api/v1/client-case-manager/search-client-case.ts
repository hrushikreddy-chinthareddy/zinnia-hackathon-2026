import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';
import {
    IllustrationsClientCaseSearchResponse,
    searchClientCaseQuery,
} from '@deps/types/illustrations';
import { browserLogError } from '@deps/utils/browser-logging';

import { CLIENT_CASE_MANAGER_BASE_URL } from './constants';

const buildQueryString = (queriesObject: object) => {
    return Object.entries(queriesObject)
        .filter(([, value]) => !!value)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
};

export const searchClientCase = async (
    searchClientCaseQueries: searchClientCaseQuery
) => {
    const builtQueryParams = buildQueryString(searchClientCaseQueries);

    try {
        const response = await client.get<
            searchClientCaseQuery,
            AxiosResponse<IllustrationsClientCaseSearchResponse>
        >(
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/search?${builtQueryParams}`
        );
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Object && 'data' in error) {
            const { data, status } = error as AxiosResponse;
            if (status >= 500) {
                browserLogError('Cannot fetch client cases', data);
            }
        }
        throw error;
    }
};
