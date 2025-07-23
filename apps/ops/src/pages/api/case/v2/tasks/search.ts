import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

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
    async (req: NextApiRequest, res: NextApiResponse<null>, logCtx) => {
        const now = performance.now();
        const baseUrl = `${apiServerBaseUrl}/case/v2/tasks/search`;
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const loggingContext = { ...logCtx, baseUrl };

        logTrace('TaskSearch::start', loggingContext);

        const payload = {
            ...(req.body || {}),
        };

        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const searchData = await serverApi.post<any, AxiosResponse>(
                baseUrl,
                payload,
                config,
                loggingContext
            );

            logTrace('TaskSearch::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            return res.status(200).json(searchData?.data);
        } catch (error) {
            logWarn('TaskSearch::transactions::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                inputs: {
                    ...payload,
                },
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'case/v2/tasks/search', function: 'routeHandler' }
);
