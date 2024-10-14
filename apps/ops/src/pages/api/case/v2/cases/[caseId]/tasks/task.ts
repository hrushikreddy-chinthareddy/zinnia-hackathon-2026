import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/case/v2`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const { caseId } = req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const url = `${baseUrl}/cases/${caseId}/tasks`;
        const loggingContext = { ...logCtx, caseId, url };
        logTrace('createTask::start', loggingContext);
        const formData = req.body;
        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const { data } = await serverApi.post<any, AxiosResponse>(url, formData, config, loggingContext);
            logTrace('createTask::success', { ...loggingContext, duration: performance.now() - now });
            res.json(data);
        } catch (error) {
            logWarn('createTask::error', { ...parseErrorInformation(error), ...loggingContext, duration: performance.now() - now });
            res.status(500).json(null);
        }
    },
    { file: 'cases/:caseId/tasks', function: 'routeHandler' }
);
