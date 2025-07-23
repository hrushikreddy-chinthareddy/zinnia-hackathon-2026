import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';

import { getUserData } from '@deps/helpers/query-data.helpers';
import { apiServerBaseUrl, baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ApiResponse } from '@deps/types/api-response';
import { browserLogError } from '@deps/utils/browser-logging';
import {
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

const searchUsersUrlSsr = `${apiServerBaseUrl}/fga/v1/search-users`;

export const searchUsersInGroupCSR = async (payload: any): Promise<any> => {
    try {
        const response = await client.post<void, AxiosResponse>(
            `${baseAppUrl}/api/fga/v1/search-users`,
            payload
        );
        return response?.data;
    } catch (error: any) {
        browserLogError('searchUsersInGroupCSR::an error occurred', error);
        return error;
    }
};

export const searchedUsers = async (
    accessToken: string,
    payload: any,
    logCtx: LoggingContext
) => {
    if (!accessToken) {
        return {
            data: false,
            error: {
                status: 400,
                message: 'Missing partyId or accessToken',
                name: 'Error reading users',
            },
        };
    }

    const loggingContext = {
        ...logCtx,
        file: 'queries/api/fga/searchedUsers',
        function: 'searchedUsers',
    };

    try {
        const searchedUsersData = await serverApi.post<any, AxiosResponse>(
            searchUsersUrlSsr,
            {
                ...payload,
            },
            {
                authorization: `Bearer ${accessToken}`,
            },
            loggingContext
        );

        const response: ApiResponse<any> = {
            data: searchedUsersData?.data || false,
            error: null,
        };

        if (searchedUsersData.status !== 200) {
            logWarn('searchedUsers::An error occurred while searching users', {
                ...loggingContext,
                file: 'queries/api/fga',
                function: 'searchedUsers',
                searchUsersUrlSsr,
                inputs: {},
            });

            response.error = {
                status: searchedUsersData.status,
                message: searchedUsersData.statusText,
                name: 'Error reading users',
            };
        }

        return response;
    } catch (error: any) {
        logWarn('checkTupleSsr::An error occurred while checking tuple', {
            ...loggingContext,
            ...parseErrorInformation(error),
            file: 'queries/api/fga',
            function: 'checkTupleSsr',
            searchUsersUrlSsr,
            inputs: {},
        });

        return {
            data: false,
            error: {
                status: 500,
                message: error.message,
                name: 'Error checking users',
            },
        };
    }
};

export const searchedUsersPage = async (
    ctx: GetServerSidePropsContext,
    payload: any,
    logCtx: LoggingContext
) => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/fga/searchUsers',
        function: 'searchedUsersPage',
    };

    try {
        const user = await getUserData(ctx);
        const accessToken = (await getAccessToken(ctx.req, ctx.res))
            .accessToken;
        const result = await searchedUsers(
            accessToken as string,
            payload,
            loggingContext
        );

        return result.data.users;
    } catch (e) {
        logWarn('searchedUsersPage::An error occurred while reading users', {
            ...loggingContext,
            file: 'queries/api/fga',
            function: 'searchedUsersPage',
            inputs: {
                ...payload,
            },
        });
        return false;
    }
};
