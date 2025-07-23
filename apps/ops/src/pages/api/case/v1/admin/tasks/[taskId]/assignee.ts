import { getAccessToken } from '@auth0/nextjs-auth0';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { HttpMethod } from '@deps/queries/api-utils/serverClientUtils';
import {
    logTrace,
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

enum ACTION {
    ASSIGN = 'assign',
    UNASSIGN = 'unassign',
}

const ACTION_CONFIG = {
    LOG_TRACE_SUCCESS_MESSAGE: {
        assign: 'assignTaskAsAdmin::put::success::task assignment successful',
        unassign:
            'assignTaskAsAdmin::delete::success::task unassignment successful',
    },
    LOG_TRACE_ERROR_MESSAGE: {
        assign: 'assignTaskAsAdmin::put::error::something went wrong while assigning task',
        unassign:
            'assignTaskAsAdmin::delete::error::something went wrong while unassigning task',
    },
};

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const taskId = req.query.taskId;
        const baseUrl = `${apiServerBaseUrl}/case/v1/admin/tasks/${taskId}/assignee`;

        const loggingContext = { ...logCtx, baseUrl };
        logTrace('assignTaskAsAdmin::start', loggingContext);

        const config = {
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            authorization: `Bearer ${accessToken}`,
            data: req.body,
        };
        let action: ACTION | null = null;
        try {
            let data = null;
            if (req.method === HttpMethod.PUT) {
                data = await serverApi.put(baseUrl, req.body, config, logCtx);
                action = ACTION.ASSIGN;
            } else {
                data = await serverApi.delete(baseUrl, config, logCtx);
                action = ACTION.UNASSIGN;
            }
            logTrace(ACTION_CONFIG.LOG_TRACE_SUCCESS_MESSAGE[action], {
                ...loggingContext,
                duration: performance.now() - now,
            });

            return res.status(200).json(data?.data);
        } catch (error) {
            action =
                req.method === HttpMethod.PUT ? ACTION.ASSIGN : ACTION.UNASSIGN;
            logWarn(ACTION_CONFIG.LOG_TRACE_ERROR_MESSAGE[action], {
                ...parseErrorInformation(error),
                ...loggingContext,
                inputs: {
                    ...(req.body || {}),
                },
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: `case/v1/admin/tasks/[taskId]/assignee`, function: 'routeHandler' }
);
