import { getAccessToken } from '@auth0/nextjs-auth0';

import { PolicyRole } from '@deps/constants/policy';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logError,
    logTrace,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const { planCode, policyNumber, partyId } = req.query;
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const baseUrl = `${apiServerBaseUrl}/bpm/v1/policies/${planCode}/${policyNumber}/parties/${partyId}/Assignee`;
        const loggingContext = { ...logCtx, baseUrl };
        logTrace('Remove Assignee::start', loggingContext);

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
            response = await serverApi.delete(baseUrl, config, loggingContext);
            logTrace('Remove Assignee::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            return res.status(response.status).json(response.data);
        } catch (error: any) {
            logError('Remove Assignee::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
                planCode,
                policyNumber,
                partyId,
                role: PolicyRole.ASSIGNEE,
            });
            const statusCode = error?.status || 500;
            const message =
                error?.statusText || error?.message || 'Internal Server Error';

            res.status(statusCode).json({
                message,
            });
        }
    },
    {
        file: `policies/:planCode/:policyNumber/parties/:partyId/Assignee`,
        function: 'routeHandler',
    }
);
