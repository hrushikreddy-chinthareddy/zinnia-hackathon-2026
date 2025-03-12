import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/case/v1/tasks/assignments`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const { clientCode } = req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const loggingContext = { ...logCtx, clientCode, baseUrl };
        logTrace('TaskAssignments::start', loggingContext);

        const formData = {};
        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const  data  = await serverApi.post<any, AxiosResponse>(baseUrl, formData, config, loggingContext);
            logTrace('TaskAssignments::success', { ...loggingContext, duration: performance.now() - now });
            res.json(data);
        } catch (error) {
            logWarn('TaskAssignments::transactions::error', { ...parseErrorInformation(error), ...loggingContext, duration: performance.now() - now });
            res.status(500).json(null);
        }
    },
    { file: 'case/v1/tasks/assignments', function: 'routeHandler' }
);
