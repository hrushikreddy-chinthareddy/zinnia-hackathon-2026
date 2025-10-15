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
        const { email, clientId, searchTerms, page = 0, size = 10 } = req.body;

        if (!email || !clientId || !searchTerms) {
            logError(
                'Error searching chat sessions:: missing email, clientId or search input',
                loggingContext
            );
            return res
                .status(400)
                .json({ error: 'missing email, clientId or search input' });
        }

        const url = `${apiServerBaseUrl}/api/v1/chat/search`;

        try {
            logInfo(
                `Searching chat sessions for client: ${clientId}`,
                loggingContext
            );

            const { data, status } = await serverApi.post<any, AxiosResponse>(
                url,
                {
                    email,
                    clientId,
                    searchTerms,
                    page,
                    size,
                },
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
            logError('Error searching chat sessions', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/search-chat-sessions/index',
        function: 'routeHandler',
    }
);
