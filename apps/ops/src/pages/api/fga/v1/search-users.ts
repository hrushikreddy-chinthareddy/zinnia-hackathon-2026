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
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse, logCtx) => {
        const now = performance.now();
        const method = req.method;
        const baseUrl = `${apiServerBaseUrl}/fga/v1/search-users`;
        const session = await getSession(req, res);
        const loggingContext = { ...logCtx, baseUrl };
        const LOG_PREFIX = 'SerachUsers';
        logTrace(`${LOG_PREFIX}::${method}::start`, loggingContext);
        const accessToken = session?.accessToken;

        const partyId = session?.user.partyId;

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
                    inputs: req.body,
                    isAdmin,
                    partyId,
                });

                res.status(StatusCode.Forbidden).json({
                    message: `${LOG_PREFIX}::error::user is not admin`,
                });
                return;
            }

            const response = await EnterpriseTokenApi.post(
                baseUrl,
                JSON.stringify(req.body),
                {
                    headers: { 'Content-Type': 'application/json' },
                },
                loggingContext
            );
            const data = await response.json();

            logTrace(`${LOG_PREFIX}::${method}::success`, {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.status(HttpStatusCode.Ok).json(data.users);
        } catch (error) {
            logWarn(`${LOG_PREFIX}::${method}::error`, {
                ...parseErrorInformation(error),
                ...loggingContext,
                inputs: {
                    ...(req.body || {}),
                },
                duration: performance.now() - now,
            });
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(parseErrorInformation(error)?.requestData);
        }
    },
    { file: 'fga/v1/search-users', function: 'routeHandler' }
);
