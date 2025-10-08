import { getAccessToken } from '@auth0/nextjs-auth0';
import { HttpStatusCode } from 'axios';

import { HttpMethod } from '@deps/constants/policy';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { SSEEventType } from '@deps/types/knowledge-base';
import {
    logError,
    logTrace,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

function sendSSE(
    res: NextApiResponse,
    type: SSEEventType,
    payload: Record<string, any>
) {
    const data = JSON.stringify({ type, ...payload });
    res.write(`event: message\ndata: ${data}\n\n`);
    (res as any).flush?.();
}

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse, loggingContext) => {
        if (req.method !== HttpMethod.GET.toUpperCase()) {
            logError('Invalid method', { ...loggingContext });
            return res
                .status(HttpStatusCode.MethodNotAllowed)
                .json({ error: 'Method not allowed' });
        }

        const { sessionId, question, clientId } = req.query;
        if (!sessionId || !question || !clientId) {
            logError(
                'Missing sessionId, question, or clientId',
                loggingContext
            );
            return res
                .status(HttpStatusCode.BadRequest)
                .json({ error: 'Missing sessionId, question, or clientId' });
        }

        const accessToken = (await getAccessToken(req, res)).accessToken;
        const url = `${apiServerBaseUrl}/api/v1/chat/sessions/${sessionId}/messages/stream`;
        try {
            logTrace('Sending upstream request', { ...loggingContext, url });
            const upstream = await fetch(url, {
                method: HttpMethod.POST.toUpperCase(),
                headers: {
                    accept: 'text/event-stream',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ question, clientId }),
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

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    logTrace('Upstream stream ended', loggingContext);
                    break;
                }
                logTrace('Received upstream chunk', {
                    length: value?.length,
                    ...loggingContext,
                });

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';

                for (const part of parts) {
                    const dataLine = part
                        .split('\n')
                        .find((line) => line.startsWith('data:'));
                    if (!dataLine) continue;
                    try {
                        const jsonLine = dataLine.replace(/^data:\s*/, '');
                        const event = JSON.parse(jsonLine);
                        logTrace('Parsed upstream event', {
                            type: event.type,
                            ...loggingContext,
                        });

                        if (event.type === SSEEventType.STATUS) {
                            sendSSE(res, SSEEventType.STATUS, {
                                message: event.message,
                            });
                        } else if (event.type === SSEEventType.TOKEN) {
                            sendSSE(res, SSEEventType.TOKEN, {
                                content: event.content,
                            });
                            full_response += event.content;
                        } else if (event.type === SSEEventType.SOURCES) {
                            sendSSE(res, SSEEventType.SOURCES, {
                                source_documents: event.source_documents,
                            });
                        } else if (event.type === SSEEventType.COMPLETE) {
                            full_response = event.full_response;
                            questionId = event.questionId;
                            responseId = event.responseId;
                            logTrace('Received COMPLETE event', loggingContext);
                        } else if (event.type === SSEEventType.ERROR) {
                            logError('Received ERROR event', {
                                error: event.error,
                                ...loggingContext,
                            });
                            sendSSE(res, SSEEventType.ERROR, {
                                error: event.error,
                            });
                            res.end();
                        }
                    } catch (error) {
                        logError('Bad upstream SSE line::chat-stream', {
                            ...parseErrorInformation(error),
                            ...loggingContext,
                            raw: part,
                        });
                    }
                }
            }
            logTrace('Sending final COMPLETE event', loggingContext);
            sendSSE(res, SSEEventType.COMPLETE, {
                full_response,
                questionId,
                responseId,
            });
            res.end();
            logTrace('Response stream ended', loggingContext);
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
        file: 'knowledge-base/chat-stream/index',
        function: 'routeHandler',
    }
);
