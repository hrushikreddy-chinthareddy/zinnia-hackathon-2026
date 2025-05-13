import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logInfo, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/webnonfinancial/claim/v1`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const { contractNumber, clientId } = req.query;
        const url = `${baseUrl}/initialdeathclaim/exists?contractNumber=${contractNumber}&clientId=${clientId}`;
        const loggingContext = { ...logCtx, url };
        logInfo('initialdeathclaim::exists::start', loggingContext);

        try {
            const { data } = await serverApi.get<null, AxiosResponse>(
                url,
                {
                    authorization: `Bearer ${accessToken}`,
                    headers: {
                        Accept: '*/*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        Connection: 'keep-alive',
                        'Access-Control-Allow-Origin': '*',
                    },
                },
                loggingContext
            );
            logInfo('initialdeathclaim::exists::success::Successfully checked initial deathe claim existence', { ...loggingContext, data, duration: performance.now() - now });
            return res.json(data);
        } catch (error) {
            logWarn('initialdeathclaim::exists::error::Unable to check initial deathe claim existence', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            return res.status(500).json(null);
        }
    },
    { file: 'webnonfinancial/claim/v1/initialdeathclaim/exist', function: 'routeHandler' }
);
