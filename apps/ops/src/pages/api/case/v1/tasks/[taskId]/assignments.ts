import { getAccessToken } from '@auth0/nextjs-auth0';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';

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

        const loggingContext = { ...logCtx, baseUrl, method };
        logTrace(`assignments::${method}::start`, loggingContext);

        const config = {
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            let response;
            if (method === 'PUT') {
                response = await serverApi.put(baseUrl, {}, config);
            } else if (method === 'DELETE') {
                response = await serverApi.delete(baseUrl, config);
            } else {
                return res.status(405).json({ error: `Method ${method} not allowed` });
            }

            logTrace(`serverApiClient::${method}::success`, {
                ...loggingContext,
                duration: performance.now() - now,
            });

            return res.status(200).json(response.data);
        } catch (error) {
            logWarn(`serverApiClient::${method}::error`, {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    { file: 'case/v1/tasks/[taskId]/assignments', function: 'routeHandler' }
);
