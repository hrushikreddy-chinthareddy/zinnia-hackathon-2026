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

        const { messageId } = req.query;

        if (!messageId) {
            logError(
                'Error getting followups::missing or invalid messageId',
                loggingContext
            );
            return res
                .status(400)
                .json({ error: 'Missing or invalid messageId' });
        }

        const url = `${apiServerBaseUrl}/api/v1/chat/messages/${messageId}/followups`;

        try {
            logCompliance(
                `Fetching followup chain for message: ${messageId}`,
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
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/chat-history/index',
        function: 'routeHandler',
    }
);
