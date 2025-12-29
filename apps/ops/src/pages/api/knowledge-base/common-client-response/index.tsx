import { getAccessToken } from '@auth0/nextjs-auth0';
import { HttpStatusCode } from 'axios';

import { HttpMethod } from '@deps/constants/policy';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { AnswerMode, SSEEventType } from '@deps/types/knowledge-base';
import {
    logError,
    logTrace,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import { createSSEEventHandler, handleSSEChunk, sendSSE } from '../utils';

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse, loggingContext) => {
        if (req.method !== HttpMethod.GET.toUpperCase()) {
            logError('Invalid method', { ...loggingContext });
            return res
                .status(HttpStatusCode.MethodNotAllowed)
                .json({ error: 'Method not allowed' });
        }

        const {
            sessionId,
            question,
            messageId,
            commonClientId,
            responseType = AnswerMode.Short,
        } = req.query;
        if (!sessionId || !question || !messageId || !commonClientId) {
            logError(
                `Missing sessionId, question, messageId or commonClientId:: sessionId=${sessionId}, question=${question}, messageId=${messageId}, commonClientId=${commonClientId}`,
                loggingContext
            );
            return res.status(HttpStatusCode.BadRequest).json({
                error: 'Missing sessionId, question, messageId or commonClientId',
            });
        }

        const accessToken = (await getAccessToken(req, res)).accessToken;
        const url = `${apiServerBaseUrl}/api/v1/chat/sessions/${sessionId}/messages/${messageId}/stream`;
        try {
            logTrace('Sending upstream request', { ...loggingContext, url });
            const upstream = await fetch(url, {
                method: HttpMethod.PUT.toUpperCase(),
                headers: {
                    accept: 'text/event-stream',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${accessToken} `,
                },
                body: JSON.stringify({
                    question,
                    clientId: commonClientId,
                    responseType,
                }),
            });

            logTrace('Upstream response received', {
                status: upstream.status,
                ok: upstream.ok,
                ...loggingContext,
            });
            if (!upstream.ok || !upstream.body) {
                const text = await upstream.text();
                logError('Upstream returned error', {
                    status: upstream.status,
                    body: text,
                    ...loggingContext,
                });
                return res.status(upstream.status).send(text);
            }

            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('X-Accel-Buffering', 'no');
            res.flushHeaders?.();

            logTrace('Streaming headers set', loggingContext);

            const reader = upstream.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';
            let full_response = '';
            let questionId = '';
            let responseId = '';
            let definitiveAnswerFound = null;

            const eventHandler = createSSEEventHandler(res, loggingContext, {
                onToken: (content) => {
                    full_response += content;
                },
                onComplete: (event) => {
                    full_response = event.full_response;
                    questionId = event.questionId;
                    responseId = event.responseId;
                    definitiveAnswerFound = event.definitiveAnswerFound;
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
                questionId,
                responseId,
                definitiveAnswerFound,
            });
            res.end();
        } catch (err: any) {
            logError('Proxy error::chat-stream', {
                ...parseErrorInformation(err),
                ...loggingContext,
            });
            res.status(HttpStatusCode.InternalServerError).json({
                error: 'Failed to connect to chat stream',
            });
        }
    },
    {
        file: 'knowledge-base/common-client-response/index',
        function: 'routeHandler',
    }
);
