import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logInfo, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/case/v2`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const { caseId, taskId } = req.query;
        const url = `${baseUrl}/cases/${caseId}/tasks/${taskId}`;
        const loggingContext = { ...logCtx, caseId, taskId, url };

        try {
            const accessToken = (await getAccessToken(req, res)).accessToken;
            if (!accessToken) {
                return res.status(401).json({});
            }

            logInfo('updateTask::start', loggingContext);

            const formData = req.body;
            const config = {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    'Content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            };

            const { data } = await serverApi.put<any, AxiosResponse>(url, formData, config, loggingContext);
            logInfo('updateTask::success', { ...loggingContext, duration: performance.now() - now });
            res.json(data);
        } catch (error) {
            logWarn('updateTask::error', { ...parseErrorInformation(error), ...loggingContext, duration: performance.now() - now });
            res.status(500).json(null);
        }
    },
    { file: 'cases/:caseId/tasks/:taskId', function: 'routeHandler' }
);

// Addresses NextJS error: API response for this route exceeds 4MB. API Routes are meant to respond quickly.
// Occurs when documents are very large
export const config = {
    api: {
        responseLimit: false,
    },
};
