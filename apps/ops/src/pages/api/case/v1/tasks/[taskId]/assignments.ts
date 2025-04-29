import { getAccessToken } from '@auth0/nextjs-auth0';

import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { HttpMethod } from '@deps/queries/api-utils/serverClientUtils';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';
import { HttpStatusCode } from 'axios';

type error = {
    error: string;
};

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<ClaimNextTask | null | error>, logCtx) => {
        const now = performance.now();
        const method = req.method;
        const { taskId } = req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const baseUrl = `${apiServerBaseUrl}/case/v1/tasks/${taskId}/assignments`;

        const loggingContext = { ...logCtx, baseUrl };
        logTrace(`assignments::${method}::start`, loggingContext);

        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            let response;
            if (method === HttpMethod.PUT) {
                response = await serverApi.put(baseUrl, {}, config, loggingContext);
            } else if (method === HttpMethod.DELETE) {
                response = await serverApi.delete(baseUrl, config, loggingContext);
            } else {
                return res.status(HttpStatusCode.MethodNotAllowed).json({ error: `Method ${method} not allowed` });
            }

            logTrace(`serverApiClient::${method}::success`, {
                ...loggingContext,
                duration: performance.now() - now,
            });

            return res.status(HttpStatusCode.Ok).json(response.data);
        } catch (error) {
            logWarn(`serverApiClient::${method}::error`, {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.status(HttpStatusCode.InternalServerError).json({ error: 'Internal Server Error' });
        }
    },
    { file: 'case/v1/tasks/[taskId]/assignments', function: 'routeHandler' }
);
