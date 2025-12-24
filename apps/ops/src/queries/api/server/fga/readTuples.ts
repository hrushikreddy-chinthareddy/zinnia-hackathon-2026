import { getAccessToken } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ApiResponse } from '@deps/types/api-response';
import {
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

const readUsersTuplesUrlSsr = `${apiServerBaseUrl}/fga/v1/tuples`;

type TuplesData = {
    tuples: {
        key: {
            user: string;
            object: string;
            relation: string;
            condition: string;
        };
        timestamp: string;
    }[];
};

// FIXME: the results may be paginated, and this would only read the first page
export const readUserTuples = async (
    accessToken: string,
    queryString: string,
    logCtx: LoggingContext
) => {
    if (!accessToken) {
        const ret: ApiResponse<TuplesData> = {
            data: null,
            error: {
                status: 400,
                message: 'Missing partyId or accessToken',
                name: 'Error reading tuple',
            },
        };

        return ret;
    }

    const loggingContext = {
        ...logCtx,
        file: 'queries/api/fga/readUserTuples',
        function: 'readUsersTuples',
    };
    const url = `${readUsersTuplesUrlSsr}?${queryString}`;

    try {
        const usersTuples = await serverApi.get<TuplesData>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
            },
            loggingContext
        );

        const response: ApiResponse<TuplesData> = {
            data: usersTuples?.data,
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

        const ret: ApiResponse<TuplesData> = {
            data: null,
            error: {
                status: 500,
                message: error.message,
                name: 'Error checking tuple',
            },
        };

        return ret;
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
    }
    return null;
};
