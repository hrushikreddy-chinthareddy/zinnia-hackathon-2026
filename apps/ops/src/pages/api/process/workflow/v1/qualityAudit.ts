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
        const baseUrl = `${apiServerBaseUrl}/process/workflow/v1/qualityaudit`;
        const loggingContext = { ...logCtx, baseUrl };
        logTrace('CreateQualityAudit::start', loggingContext);

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
            let response = null;
            response = await serverApi.post(
                baseUrl,
                req.body,
                config,
                loggingContext
            );

            logTrace('CreateQualityAudit::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.status(response?.status).json(response?.data);
        } catch (error: any) {
            logWarn('CreateQualityAudit::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            const statusCode = error?.status || 500;
            const message =
                error?.statusText || error?.message || 'Internal Server Error';

            res.status(statusCode).json({
                message,
            });
        }
    },
    { file: `process/workflow/v1/qualityaudit`, function: 'routeHandler' }
);
