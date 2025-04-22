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

        const url = `${apiServerBaseUrl}/party/v1/parties/${partyId}/reference`;

        const loggingContext = { ...logCtx, url, partyId };
        logTrace('parties/reference::start', loggingContext);

        try {
            const { data } = await serverApi.get<null, AxiosResponse>(
                url,
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
            // const data = await serverApi.get(baseUrl, config);
            logTrace('parties/reference::success::Successfully retrieved assigned tasks', {
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.json(data);
        } catch (error) {
            logWarn('parties/reference::error::something went wrong while retrieving the party metatdata', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'party/v1/parties/reference', function: 'routeHandler' }
);
