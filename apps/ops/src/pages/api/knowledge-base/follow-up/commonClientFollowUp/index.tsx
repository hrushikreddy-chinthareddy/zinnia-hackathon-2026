import { getAccessToken } from '@auth0/nextjs-auth0';
import { HttpStatusCode } from 'axios';

import { HttpMethod } from '@deps/constants/policy';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { SSEEventType } from '@deps/types/knowledge-base';
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

        const { followUpId, followUpQuestion, commonClientId } = req.query;
        if (!followUpId || !followUpQuestion || !commonClientId) {
            logError(
                `Missing followUpId, followUpQuestion or commonClientId:: followUpId=${followUpId}, followUpQuestion=${followUpQuestion}, commonClientId=${commonClientId}`,
                loggingContext
            );
            return res.status(HttpStatusCode.BadRequest).json({
                error: 'Missing followUpId, followUpQuestion or commonClientId',
            });
        }

        const accessToken = (await getAccessToken(req, res)).accessToken;
        const url = `${apiServerBaseUrl}/api/v1/chat/follow-ups/${followUpId}/stream`;

        try {
            const upstream = await fetch(url, {
                method: HttpMethod.PUT.toUpperCase(),
                headers: {
                    accept: '*/*',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    followUpQuestion,
                    clientId: commonClientId,
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
            let definitiveAnswerFound = null;

            const eventHandler = createSSEEventHandler(res, loggingContext, {
                onToken: (content) => {
                    full_response += content;
                },
                onComplete: (event) => {
                    full_response = event.full_response;
                    definitiveAnswerFound = event.definitive_answer_found;
                },
            });
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';
                for (const part of parts) {
                    handleSSEChunk(part, eventHandler, loggingContext);
                }
            }
            sendSSE(res, SSEEventType.COMPLETE, {
                full_response,
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
        file: 'knowledge-base/follow-up/commonClientFollowUp/index',
        function: 'routeHandler',
    }
);
