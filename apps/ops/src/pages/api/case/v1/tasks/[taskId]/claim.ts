import { getAccessToken } from '@auth0/nextjs-auth0';

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
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const taskId = req.query.taskId;
        const baseUrl = `${apiServerBaseUrl}/case/v1/tasks/${taskId}/claim`;

        const loggingContext = { ...logCtx, baseUrl };
        logTrace('claimTask::start', loggingContext);

        const config = {
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const data = await serverApi.patch(baseUrl, config, loggingContext);
            logTrace('claimNextTask::patch::success::task claimed successful', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.status(200).send(await data.json());
        } catch (error) {
            logWarn(
                'claimNextTask::patch::error::something went wrong while claiming task',
                {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    duration: performance.now() - now,
                }
            );
            res.status(500).json(null);
        }
    },
    { file: `case/v1/tasks/[taskId]/claim`, function: 'routeHandler' }
);
