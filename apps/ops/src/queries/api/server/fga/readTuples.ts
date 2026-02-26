import { getSession } from '@auth0/nextjs-auth0';
import { HttpStatusCode } from 'axios';
import { GetServerSidePropsContext } from 'next';

import { getUserData } from '@deps/helpers/query-data.helpers';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { ApiResponse } from '@deps/types/api-response';
import {
    getRolesFromCookie,
    setRolesCookie,
} from '@deps/utils/permissionsCookie';
import {
    logError,
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';
import { ReadTuplesResponse } from '@zinnia/api-types/types/fga';

const readUsersTuplesUrlSsr = `${apiServerBaseUrl}/fga/v1/tuples`;

// FIXME: the results may be paginated, and this would only read the first page
export const readUserTuples = async (
    accessToken: string,
    queryString: string,
    logCtx: LoggingContext
) => {
    if (!accessToken) {
        const ret: ApiResponse<ReadTuplesResponse> = {
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
        const usersTuples = await EnterpriseTokenApi.get(
            url,
            {},
            loggingContext
        );

        const response: ApiResponse<ReadTuplesResponse> = {
            data: (await usersTuples.json()) || null,
            error: null,
        };

        if (usersTuples.status !== HttpStatusCode.Ok) {
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

            return response;
        }

        return response;
    } catch (error: any) {
        logError('checkTupleSsr::An error occurred while checking tuple', {
            ...loggingContext,
            ...parseErrorInformation(error),
            file: 'queries/api/fga',
            function: 'checkTupleSsr',
            url,
            inputs: { queryString },
        });

        const ret: ApiResponse<ReadTuplesResponse> = {
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

export const userRolesMap = (tuples: ReadTuplesResponse['tuples']) => {
    return tuples?.reduce<Record<string, string[]>>(
        (acc, { key: relationalData }) => {
            if (
                !relationalData ||
                typeof relationalData !== 'object' ||
                !('object' in relationalData) ||
                typeof relationalData.object !== 'string' // not defined in spec
            ) {
                return acc;
            }
            const { object } = relationalData;
            // Anything between 'role:' and the first '_' will be treated as the carrier code,
            // and everything after the first '_' will be treated as the role type (generic role)
            // This is a stopgap solution until personas are implemented in FGA
            const [_, carrierCode, roleType] =
                object.match(/^role:([^_]+)_(.+)$/) ?? [];

            if (!roleType) {
                return acc;
            }

            return {
                ...acc, // Existing roles
                [roleType]: [
                    ...(acc[roleType] || []), // Existing carrier codes
                    carrierCode,
                ],
            };
        },
        {}
    );
};

export const readAndStoreUserRolesCookie = async (
    ctx: GetServerSidePropsContext,
    logCtx: LoggingContext
) => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/fga/readTuples',
        function: 'readUserTuplesPage',
    };

    try {
        const rolesFromCookie = getRolesFromCookie(ctx.req, ctx.res);
        if (rolesFromCookie) {
            return rolesFromCookie;
        }

        const user = await getUserData(ctx);
        const tuplesQuery = `user=party:${user.partyId}&object=role:&pageSize=100`;
        const session = await getSession(ctx.req, ctx.res);
        const accessToken = session?.accessToken;
        const result = await readUserTuples(
            accessToken as string,
            tuplesQuery,
            loggingContext
        );

        const rolesMap = userRolesMap(result.data?.tuples);

        if (rolesMap) {
            setRolesCookie(rolesMap, ctx.req, ctx.res);
        }

        return rolesMap;
    } catch (e) {
        logError(
            'readUserTuplePage::An error occurred while reading users tuple',
            {
                ...loggingContext,
                file: 'queries/api/fga',
                function: 'readUsersTuplePage',
            }
        );
    }
};
