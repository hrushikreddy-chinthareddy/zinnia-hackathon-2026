import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const session = await getSession(req, res);

        const partyId = session?.user.partyId;

        const url = `${apiServerBaseUrl}/party/v1/parties/reference/batch-get`;

        const loggingContext = { ...logCtx, url, partyId };
        logTrace('parties/reference::start', loggingContext);

        try {
            const data = await serverApi.post<any, AxiosResponse>(
                url,
                req.body,
                {
                    authorization: `Bearer ${accessToken}`,
                    headers: {
                        Accept: '*/*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        Connection: 'keep-alive',
                    },
                },
                loggingContext
            );
            logTrace('parties/reference/batch-get::success::Successfully retrieved user details', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.json(data?.data);
        } catch (error) {
            logWarn('parties/reference/batch-get::error::something went wrong while retrieving the party metatdata', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'party/v1/parties/reference/batch-get', function: 'routeHandler' }
);
