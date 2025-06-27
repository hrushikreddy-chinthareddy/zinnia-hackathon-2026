import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logTrace,
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/api/validation/v1/`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const { clientCode } = req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const url = `${baseUrl}/${clientCode}/addressvalidation`;
        const loggingContext = { ...logCtx, clientCode, url };
        logTrace('addressvalidation::start', loggingContext);

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
            const { data } = await serverApi.post<any, AxiosResponse>(
                url,
                formData,
                config,
                loggingContext
            );
            logTrace('addressvalidation::success', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.json(data);
        } catch (error) {
            logWarn('addressvalidation::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    {
        file: 'api/validation/v1/:clientCode/addressvalidation',
        function: 'routeHandler',
    }
);
