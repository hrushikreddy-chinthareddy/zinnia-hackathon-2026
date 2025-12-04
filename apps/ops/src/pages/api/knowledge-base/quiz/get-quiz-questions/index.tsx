import { getAccessToken } from '@auth0/nextjs-auth0';

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
    async (req: NextApiRequest, res: NextApiResponse, loggingContext) => {
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const { clientId } = req.query;

        if (!clientId) {
            logError(
                'Error getting quiz questions:: missing clientId',
                loggingContext
            );
            return res.status(400).json({ error: 'missing clientId' });
        }

        const url = `${apiServerBaseUrl}/api/v1/clients/${clientId}/quiz`;

        try {
            logInfo(
                `Getting quiz questions for client: ${clientId}`,
                loggingContext
            );

            const { data, status } = await serverApi.get(
                url,
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
            logError('Error getting quiz questions', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/quiz/get-quiz-questions/index',
        function: 'routeHandler',
    }
);
