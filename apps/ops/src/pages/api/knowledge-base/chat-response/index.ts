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
        const { sessionId, question, clientId } = req.body;

        const controller = new AbortController();

        req.on('close', () => {
            controller.abort();
        });

        if (!sessionId || !question || !clientId) {
            logError(
                'Error getting chatbot response::missing sessionId, question, or clientId',
                loggingContext
            );
            return res
                .status(400)
                .json({ error: 'missing sessionId, question, or clientId' });
        }

        const url = `${apiServerBaseUrl}/api/v1/chat/sessions/${sessionId}/messages`;

        try {
            logCompliance(
                `Fetching chatbot response for session ${sessionId}`,
                loggingContext
            );

            const { data, status } = await serverApi.post<any, AxiosResponse>(
                url,
                { question, clientId },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                },
                loggingContext
            );

            res.status(status).json(data);
        } catch (error: any) {
            if (controller.signal.aborted) {
                logError('Request aborted by user', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                });
                return res.status(499).end();
            }
            logError('Error fetching chatbot response', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            return res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/chat-response/index',
        function: 'routeHandler',
    }
);
