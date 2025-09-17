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
        const {
            messageId,
            followUpQuestion,
            clientId,
            parentFollowUpId = null,
        } = req.body;

        if (!messageId || !followUpQuestion || !clientId) {
            logError(
                'Error sending followup:: missing messageId, followUpQuestion or clientId',
                loggingContext
            );
            return res.status(400).json({
                error: 'missing messageId, followUpQuestion or clientId',
            });
        }

        const url = `${apiServerBaseUrl}/api/v1/chat/messages/${messageId}/followup`;
        try {
            logCompliance(
                `Submitting followup for messageId: ${messageId}`,
                loggingContext
            );

            const { data } = await serverApi.post<any, AxiosResponse>(
                url,
                {
                    followUpQuestion,
                    clientId,
                    parentFollowUpId,
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
            res.status(200).json(data?.body);
        } catch (error: any) {
            logError('Error sending followup', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/follow-up/sendFollowUp/index',
        function: 'routeHandler',
    }
);
