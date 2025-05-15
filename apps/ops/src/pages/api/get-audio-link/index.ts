import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logInfo, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const { sessionID } = req.query;
        if (!sessionID || typeof sessionID !== "string" || sessionID === undefined) {
            return res.status(400).json({ error: "Missing or invalid sessionID" });
        }
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const url = `${apiServerBaseUrl}/call-center-ai-solutions/v1/call-recordings?sessionId=${sessionID}`;
        const loggingContext = { ...logCtx, url };
        logInfo('call-recordings:get-audio-link::start', loggingContext);

        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'x-api-key': process.env.CALL_LOG_X_API_KEY as string,
            },
        };

        try {
            const { data } = await serverApi.get<any, AxiosResponse>(
                url,
                config,
                loggingContext
            );
            logInfo('call-recordings:get-audio-link::success', { ...loggingContext, duration: performance.now() - now });
            res.json(data);
        } catch (error: any) {
            logWarn('call-recordings:get-audio-link::error', { ...parseErrorInformation(error), ...loggingContext, duration: performance.now() - now });
            const statusCode = error?.status || 500;
            const message = error?.statusText || error?.message || 'Internal Server Error';

            res.status(statusCode).json({
                message,
            });
        }
    },
    { file: 'get-audio-link/index', function: 'routeHandler' }
);