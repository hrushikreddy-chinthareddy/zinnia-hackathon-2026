import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logCompliance,
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<any | null>,
        loggingContext
    ) => {
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const { email, clientId, page, size } = req.body;

        if (!email || !clientId) {
            logError(
                'Error getting chat sessions::missing email or clientId',
                loggingContext
            );
            return res.status(400).json({ error: 'missing email or clientId' });
        }

        const url = `${apiServerBaseUrl}/api/v1/chat/sessions/list`;

        try {
            logCompliance(
                `Fetching chat sessions for clientId: ${clientId}`,
                loggingContext
            );

            const { data, status } = await serverApi.post<any, AxiosResponse>(
                url,
                { email, clientId, page, size },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
                loggingContext
            );
            res.status(status).json(data);
        } catch (error: any) {
            logError('Error fetching chat sessions', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/chat-sessions/index',
        function: 'routeHandler',
    }
);
