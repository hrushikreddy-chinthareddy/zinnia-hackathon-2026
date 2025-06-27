import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { policyApiBaseUrl } from '@deps/queries/api-config';
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
        const { id, planCode, partyId } = req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const url = `${policyApiBaseUrl}/${planCode}/${id}/addressDetails?partyId=${partyId}`;
        const loggingContext = { ...logCtx, url };
        logTrace('addressdetails::start', loggingContext);

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
            const { data } = await serverApi.get<any, AxiosResponse>(
                url,
                config,
                loggingContext
            );
            logTrace('addressdetails::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.json(data);
        } catch (error) {
            logWarn('addressdetails::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    {
        file: 'policy/v1/policies/:planCode/:id/addressdetails',
        function: 'routeHandler',
    }
);
