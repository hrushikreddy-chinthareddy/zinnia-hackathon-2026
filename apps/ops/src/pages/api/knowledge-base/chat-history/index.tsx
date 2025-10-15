import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logError,
    logInfo,
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

        const { sessionId } = req.query;

        if (!sessionId || typeof sessionId !== 'string') {
            logError(
                'Error getting chat history::missing or invalid sessionId',
                loggingContext
            );
            return res
                .status(400)
                .json({ error: 'Missing or invalid sessionId' });
        }

        const url = `${apiServerBaseUrl}/api/v1/chat/sessions/${sessionId}/messages`;

        try {
            logInfo(
                `Fetching chat history for session ${sessionId}`,
                loggingContext
            );

            const { data, status } = await serverApi.get<any, AxiosResponse>(
                url,
                {
                    headers: {
                        Authorization: 'Bearer ' + accessToken,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
                loggingContext
            );

            res.status(status).json(data);
        } catch (error: any) {
            logError('Error fetching chat history', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });

            return res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/chat-history/index',
        function: 'routeHandler',
    }
);
