import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<ClaimNextTask | null>, logCtx) => {
        const now = performance.now();
        const baseUrl = `${apiServerBaseUrl}/case/v1/tasks/assignments`;
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const loggingContext = { ...logCtx, baseUrl };

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
            const data = await serverApi.post<any, AxiosResponse>(baseUrl, formData, config, loggingContext);
            logTrace('TaskAssignments::success', { ...loggingContext, duration: performance.now() - now });
            return res.status(200).json(data.data);
        } catch (error) {
            logWarn('TaskAssignments::transactions::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'case/v1/tasks/assignments', function: 'routeHandler' }
);
