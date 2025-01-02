import { getAccessToken } from '@auth0/nextjs-auth0';

import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<ClaimNextTask | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const taskId = req.query.taskId;
        const baseUrl = `${apiServerBaseUrl}/case/v1/tasks/${taskId}/unclaim`;

        const loggingContext = { ...logCtx, baseUrl };
        logTrace('unclaimTask::start', loggingContext);

        const config = {
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const data = await serverApi.patch(baseUrl, config);
            console.log(data);
            logTrace('unclaimTask::patch::success::task unclaimed successful', {
                ...loggingContext,
                data,
                duration: performance.now() - now,
            });
            return res.status(200).send(await data.json());
        } catch (error) {
            logWarn('unclaimTask::patch::error::something went wrong while unclaim task', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: `case/v1/tasks/[taskId]/unclaim`, function: 'routeHandler' }
);
