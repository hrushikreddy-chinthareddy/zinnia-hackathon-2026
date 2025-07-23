import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';

import { getUserData } from '@deps/helpers/query-data.helpers';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ApiResponse } from '@deps/types/api-response';
import {
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

const readUsersTuplesUrlSsr = `${apiServerBaseUrl}/fga/v1/tuples`;

export const readUserTuples = async (
    accessToken: string,
    queryString: string,
    logCtx: LoggingContext
) => {
    if (!accessToken) {
        return {
            data: false,
            error: {
                status: 400,
                message: 'Missing partyId or accessToken',
                name: 'Error reading tuple',
            },
        };
    }

    const loggingContext = {
        ...logCtx,
        file: 'queries/api/fga/readUserTuples',
        function: 'readUsersTuples',
    };
    const url = `${readUsersTuplesUrlSsr}?${queryString}`;

    try {
        const usersTuples = await serverApi.get<any, AxiosResponse>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
            },
            loggingContext
        );

        const response: ApiResponse<any> = {
            data: usersTuples?.data || false,
            error: null,
        };

        if (usersTuples.status !== 200) {
            logWarn('checkTuple::An error occurred while checking tuple', {
                ...loggingContext,
                file: 'queries/api/fga',
                function: 'readUsersTuples',
                url,
                inputs: {},
            });

            response.error = {
                status: usersTuples.status,
                message: usersTuples.statusText,
                name: 'Error reading users tuple',
            };
        }

        return response;
    } catch (error: any) {
        logWarn('checkTupleSsr::An error occurred while checking tuple', {
            ...loggingContext,
            ...parseErrorInformation(error),
            file: 'queries/api/fga',
            function: 'checkTupleSsr',
            url,
            inputs: {},
        });

        return {
            data: false,
            error: {
                status: 500,
                message: error.message,
                name: 'Error checking tuple',
            },
        };
    }
};

export const readUserTuplesPage = async (
    ctx: GetServerSidePropsContext,
    queryString: string,
    logCtx: LoggingContext
) => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/fga/readTuples',
        function: 'readUserTuplesPage',
    };

    try {
        const user = await getUserData(ctx);
        const accessToken = (await getAccessToken(ctx.req, ctx.res))
            .accessToken;

        const result = await readUserTuples(
            accessToken as string,
            queryString,
            loggingContext
        );

        if (!result.error) {
            return result.data;
        }
    } catch (e) {
        logWarn(
            'readUserTuplePage::An error occurred while reading users tuple',
            {
                ...loggingContext,
                file: 'queries/api/fga',
                function: 'readUsersTuplePage',
                inputs: {
                    queryString,
                },
            }
        );
        return false;
    }
};
