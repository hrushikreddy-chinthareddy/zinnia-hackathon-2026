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
        const caseId = req.query.caseId;
        const baseUrl = `${apiServerBaseUrl}/case/v1/cases/links/${caseId}`;

        const loggingContext = { ...logCtx, baseUrl };
        logTrace('gettingLinkedCases::start', loggingContext);

        const config = {
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            authorization: `Bearer ${accessToken}`,
        };

        try {
            const data = await serverApi.get(baseUrl, config, logCtx);

            logTrace(
                'gettingLinkedCases::get::success::getting linked cases successful',
                {
                    ...loggingContext,
                    duration: performance.now() - now,
                }
            );

            return res.status(200).json(data?.data);
        } catch (error: any) {
            logWarn(
                'gettingLinkedCases::get::error::something went wrong while getting linked cases',
                {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    duration: performance.now() - now,
                }
            );
            res.status(error.status).json(error);
        }
    },
    { file: `case/v1/cases/links/[caseId]`, function: 'routeHandler' }
);
