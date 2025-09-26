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
      return res.status(HttpStatusCode.MethodNotAllowed).json({ error: 'Method not allowed' });
    }

    const {
      messageId,
      followUpQuestion,
      parentFollowUpId = null,
      clientId,
    } = req.query;
    if (!messageId || !followUpQuestion || !clientId) {
      logError(
        'Missing messageId, followUpQuestion, or clientId',
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

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
              followUpID = event.followUpID;
              parent_FollowUpId = event.parentFollowUpId;
            } else if (event.type === SSEEventType.ERROR) {
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
      sendSSE(res, SSEEventType.COMPLETE, {
        full_response,
        followUpID,
        parent_FollowUpId,
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