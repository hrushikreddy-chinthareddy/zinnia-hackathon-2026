import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse, HttpStatusCode } from 'axios';

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

        const { caseId } = req.query;

        const url = `${apiServerBaseUrl}/case/v1/cases/${caseId}/activity-feed/search`;

        const loggingContext = { ...logCtx, url };
        logTrace('activityFeedSearch::post', loggingContext);

        try {
            const { data } = await serverApi.post<any, AxiosResponse>(
                url,
                req.body,
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
            logTrace(
                'activityFeedSearch::success::Successfully retrieved case activity feed',
                {
                    ...loggingContext,
                    duration: performance.now() - now,
                }
            );
            return res.status(HttpStatusCode.Ok).json(data);
        } catch (error) {
            logWarn(
                'activityFeedSearch::error::something went wrong while retrieving case activity feed',
                {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    duration: performance.now() - now,
                }
            );
            res.status(HttpStatusCode.InternalServerError).json(null);
        }
    },
    {
        file: 'case/v1/[caseId]/activity-feed/search',
        function: 'routeHandler',
    }
);
