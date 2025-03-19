import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const url = `${apiServerBaseUrl}/case/v1/tasks/assigned`;

        const loggingContext = { ...logCtx, url };
        logTrace('assignedTask::start', loggingContext);

        try {
            const { data } = await serverApi.get<null, AxiosResponse>(
                url,
                {
                    authorization: `Bearer ${accessToken}`,
                    headers: {
                        Accept: '*/*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        Connection: 'keep-alive',
                        'Access-Control-Allow-Origin': '*',
                    },
                },
                loggingContext
            );
            // const data = await serverApi.get(baseUrl, config);
            logTrace('assignedTask::success::Successfully retrieved assigned tasks', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.json(data);
        } catch (error) {
            logWarn('assignedTask::error::something went wrong while retrieving assigned tasks', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'case/v1/tasks/assigned', function: 'routeHandler' }
);
