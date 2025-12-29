import { getAccessToken } from '@auth0/nextjs-auth0';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logError,
    logInfo,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';
import { QuizSubmissionResponse } from '@zinnia/api-types/types/knowledgebase';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<QuizSubmissionResponse | null>,
        loggingContext
    ) => {
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const { clientId, userId, answers } = req.body;

        if (!clientId || !userId || !answers || answers.length === 0) {
            logError(
                'Error submitting quiz answers:: missing clientId, userId or answers',
                loggingContext
            );
            return res.status(400).json(null);
        }

        const url = `${apiServerBaseUrl}/api/v1/clients/${clientId}/quiz`;

        try {
            logInfo(
                `Submitting quiz questions for client: ${clientId}`,
                loggingContext
            );

            const { data, status } = await serverApi.post(
                url,
                {
                    userId,
                    answers,
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

            res.status(status).json(data as QuizSubmissionResponse);
        } catch (error: any) {
            logError('Error submitting quiz questions', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/quiz/submit-quiz-questions/index',
        function: 'routeHandler',
    }
);
