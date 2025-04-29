import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse, HttpStatusCode } from 'axios';

import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { HttpMethod } from '@deps/queries/api-utils/serverClientUtils';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<ClaimNextTask | null>, logCtx) => {
        const now = performance.now();
        const baseUrl = `${apiServerBaseUrl}/case/v1/tasks/assignments`;
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const loggingContext = { ...logCtx, baseUrl };
        const method = req.method;

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
            let response;
            if (method === HttpMethod.POST) {
                response = await serverApi.post<any, AxiosResponse>(baseUrl, formData, config, loggingContext);
                logTrace('TaskAssignments::success', { ...loggingContext, duration: performance.now() - now });
            } else {
                response = await serverApi.get(baseUrl, config, loggingContext);
                logTrace('AssignedTasks::success', { ...loggingContext, duration: performance.now() - now });
            }
            return res.status(HttpStatusCode.Ok).json(response.data);
        } catch (error) {
            if (method === HttpMethod.POST) {
                logWarn('TaskAssignments::transactions::error', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    duration: performance.now() - now,
                });
            } else {
                logWarn('AssignedTasks::fetch::error', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    duration: performance.now() - now,
                });
            }
            res.status(HttpStatusCode.InternalServerError).json(null);
        }
    },
    { file: 'case/v1/tasks/assignments', function: 'routeHandler' }
);
