import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/webnonfinancial/nonfinancial/v1`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const { clientCode } = req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const url = `${baseUrl}/${clientCode}/transactions`;
        const loggingContext = { ...logCtx, url };
        logTrace('webnonfinancial::transactions::start', loggingContext);

        const formData = req.body;
        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        try {
            const { data } = await serverApi.put<any, AxiosResponse>(url, formData, config, loggingContext);
            logTrace('webnonfinancial::transactions::success', { ...loggingContext, duration: performance.now() - now });
            res.json(data);
        } catch (error) {
            logWarn('webnonfinancial::transactions::error', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'webnonfinancial/nonfinancial/v1', function: 'routeHandler' }
);
