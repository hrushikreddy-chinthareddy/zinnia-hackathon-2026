import { getAccessToken } from '@auth0/nextjs-auth0';
import { HttpStatusCode } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logTrace,
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any>, logCtx) => {
        const now = performance.now();
        const method = req.method;
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const baseUrl = `${apiServerBaseUrl}/fga/v1/search-users`;

        const loggingContext = { ...logCtx, baseUrl };
        logTrace(`searchUsers::${method}::start`, loggingContext);

        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const response = await serverApi.post(
                baseUrl,
                req.body,
                config,
                loggingContext
            );

            logTrace(`serverApiClient::${method}::success`, {
                ...loggingContext,
                duration: performance.now() - now,
            });

            return res.status(HttpStatusCode.Ok).json(response.data);
        } catch (error) {
            logWarn(`serverApiClient::${method}::error`, {
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
