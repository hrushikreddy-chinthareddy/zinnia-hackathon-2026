import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logTrace,
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const baseUrl = `${apiServerBaseUrl}/process/v1/externaltask/start`;

        const loggingContext = {
            ...logCtx,
            baseUrl,
            payload: req.body ?? null,
        };
        logTrace('externalTask::start', loggingContext);

        const config = {
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            authorization: `Bearer ${accessToken}`,
            data: req.body,
        };
        try {
            const data = await serverApi.post(
                baseUrl,
                req.body,
                config,
                logCtx
            );

            logTrace('ExternalTask::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            return res.status(200).json(data?.data);
        } catch (error) {
            logWarn('ExternalTask::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                inputs: {
                    ...(req.body || {}),
                },
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: `workflow/process/v1/externaltask/start`, function: 'routeHandler' }
);
