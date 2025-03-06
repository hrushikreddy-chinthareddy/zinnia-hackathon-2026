import { getAccessToken } from '@auth0/nextjs-auth0';

import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';
import { AxiosResponse } from 'axios';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<ClaimNextTask | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const baseUrl = `${apiServerBaseUrl}/case/v1/tasks/assignments`;

        const loggingContext = { ...logCtx, baseUrl };
        logTrace('claimNextTask::start', loggingContext);

        const config = {
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const data = await serverApi.post<unknown, AxiosResponse<ClaimNextTask>>(baseUrl, {}, config);
            return res.status(200).json(data.data);
        } catch (error) {
            logWarn('claimNextTask::post::error::something went wrong while claiming task', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'case/v1/tasks/assignments', function: 'routeHandler' }
);
