import { getAccessToken } from '@auth0/nextjs-auth0';
import { HttpStatusCode } from 'axios';

import { HttpMethod } from '@deps/constants/policy';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { AnswerMode, SSEEventType } from '@deps/types/knowledge-base';
import {
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import { createSSEEventHandler, handleSSEChunk, sendSSE } from '../../utils';

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse, loggingContext) => {
        if (req.method !== HttpMethod.GET.toUpperCase()) {
            return res
                .status(HttpStatusCode.MethodNotAllowed)
                .json({ error: 'Method not allowed' });
        }

        const {
            messageId,
            followUpQuestion,
            parentFollowUpId = null,
            clientId,
            responseType = AnswerMode.Short,
        } = req.query;
        if (!messageId || !followUpQuestion || !clientId) {
            logError(
                `Missing messageId, followUpQuestion, or clientId:: messageId=${messageId}, followUpQuestion=${followUpQuestion}, clientId=${clientId}`,
                loggingContext
            );
            return res.status(HttpStatusCode.BadRequest).json({
                error: 'Missing messageId, followUpQuestion, or clientId',
            });
        }

        const accessToken = (await getAccessToken(req, res)).accessToken;
        const url = `${apiServerBaseUrl}/api/v1/chat/messages/${messageId}/followup/stream`;

        try {
            const upstream = await fetch(url, {
                method: HttpMethod.POST.toUpperCase(),
                headers: {
                    accept: '*/*',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    followUpQuestion,
                    clientId,
                    parentFollowUpId,
                    responseType,
                }),
            });
            if (!upstream.ok || !upstream.body) {
                const text = await upstream.text();
                return res.status(upstream.status).send(text);
            }

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');
            res.flushHeaders?.();

            const reader = upstream.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';
            let full_response = '';
            let followUpID = '';
            let parent_FollowUpId = '';
            let definitiveAnswerFound = null;

            const eventHandler = createSSEEventHandler(res, loggingContext, {
                onToken: (content) => {
                    full_response += content;
                },
                onComplete: (event) => {
                    full_response = event.full_response;
                    followUpID = event.followUpID;
                    parent_FollowUpId = event.parentFollowUpId;
                    definitiveAnswerFound = event.definitive_answer_found;
                },
            });

            let readerDone = false;
            while (!readerDone) {
                const { done, value } = await reader.read();
                readerDone = done === true;

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';

                for (const part of parts) {
                    handleSSEChunk(part, eventHandler, loggingContext);
                }
            }
            sendSSE(res, SSEEventType.COMPLETE, {
                full_response,
                followUpID,
                parent_FollowUpId,
                definitiveAnswerFound,
            });
            res.end();
        } catch (err: any) {
            logError('Proxy error::follow-up-stream', {
                ...parseErrorInformation(err),
                ...loggingContext,
            });
            res.status(HttpStatusCode.InternalServerError).json({
                error: 'Failed to connect to follow up chat stream',
            });
        }
    },
    {
        file: 'knowledge-base/follow-up/sendFollowUpStream/index',
        function: 'routeHandler',
    }
);
