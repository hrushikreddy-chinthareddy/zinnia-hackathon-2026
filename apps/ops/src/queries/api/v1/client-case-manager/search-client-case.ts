import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { searchClientCaseQuery } from '@deps/types/illustrations';

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
        const request = client.get(
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/search?${builtQueryParams}`
        );
        const response = await request;
        if (response.status === StatusCode.Okay) {
            return { data: response.data, error: null };
        } else {
            const error = new Error(response?.statusText);
            return {
                data: null,
                error: { ...error, status: response?.status || 500 },
            };
        }
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error
                    ? e
                    : new Error(
                          (e as Error)?.message ||
                              'an error occurred while retrieving products list'
                      )),
                status: 500,
            },
        };
    }
};
