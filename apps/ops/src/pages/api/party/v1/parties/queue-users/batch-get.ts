import { getSession } from '@auth0/nextjs-auth0';
import { HttpStatusCode } from 'axios';

import { isAdminFromUserRolesMap } from '@deps/pages/tasks';
import {
    readUserTuples,
    userRolesMap,
} from '@deps/queries/api/server/fga/readTuples';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import {
    logTrace,
    logWarn,
    withAuthAndLogging,
    LoggingContext,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

// Intentionally not exported — uses an M2M token.
const fetchPartyMetadata = async (
    url: string,
    requestBody: { [key: string]: any } | undefined,
    loggingContext: LoggingContext
): Promise<Response> => {
    return EnterpriseTokenApi.post(
        url,
        JSON.stringify(requestBody),
        {
            headers: { 'Content-Type': 'application/json' },
        },
        loggingContext
    );
};

// Main handler
export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse, logCtx) => {
        const startTime = performance.now();
        const session = await getSession(req, res);
        const LOG_PREFIX = 'parties/queue-users/batch-get';
        const partyId = session?.user.partyId;

        // Early validation
        if (!partyId) {
            const errorMessage = `${LOG_PREFIX}::error::missing partyId`;
            logWarn(errorMessage, {
                ...logCtx,
                duration: performance.now() - startTime,
            });
            res.status(StatusCode.Forbidden).json({ message: errorMessage });
            return;
        }
        const accessToken = session?.accessToken;
        const url = `${apiServerBaseUrl}/party/v1/parties/reference/batch-get`;
        const loggingContext = { ...logCtx, url, partyId };

        logTrace(`${LOG_PREFIX}::start`, loggingContext);

        try {
            // Check queue admin permissions
            const tuplesQuery = `user=party:${partyId}&object=role:&pageSize=100`;

            const result = await readUserTuples(
                accessToken as string,
                tuplesQuery,
                loggingContext
            );

            // Parse roles from tuples
            const userRoles = userRolesMap(result.data?.tuples);

            const isAdmin = isAdminFromUserRolesMap(userRoles);

            // Return for non-admin users
            if (!isAdmin) {
                logWarn(`${LOG_PREFIX}::error::user is not admin`, {
                    ...loggingContext,
                    duration: performance.now() - startTime,
                    inputs: req.body,
                    isAdmin,
                    partyId,
                });

                res.status(StatusCode.Forbidden).json({
                    message: `${LOG_PREFIX}::error::user is not admin`,
                });
                return;
            }

            // Fetch party metadata for admin users
            const response = await fetchPartyMetadata(
                url,
                req.body,
                loggingContext
            );

            const data = (await response.json()) || null;

            if (response.status !== HttpStatusCode.Ok) {
                logWarn(
                    `${LOG_PREFIX}::error::An error occurred while fetching party metadata`,
                    {
                        ...loggingContext,
                        file: `${LOG_PREFIX}`,
                        function: 'routeHandler',
                        url,
                        inputs: {},
                    }
                );

                return res.status(response.status).json(data);
            }

            logTrace(
                `${LOG_PREFIX}::success::Successfully retrieved user details`,
                {
                    ...loggingContext,
                    duration: performance.now() - startTime,
                }
            );

            res.status(StatusCode.Accepted).json(data);
        } catch (error) {
            logWarn(
                `${LOG_PREFIX}::error::something went wrong while retrieving the party metadata`,
                {
                    ...loggingContext,
                    duration: performance.now() - startTime,
                    inputs: req.body,
                }
            );

            res.status(500).json({
                message: `${LOG_PREFIX}::error::something went wrong while retrieving the party metadata`,
            });
        }
    },
    { file: 'party/v1/parties/queue-users/batch-get', function: 'routeHandler' }
);
