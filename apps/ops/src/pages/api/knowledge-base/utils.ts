import { SSEEventType } from '@deps/types/knowledge-base';
import {
    logError,
    LoggingContext,
    logInfo,
    parseErrorInformation,
} from '@deps/utils/server-logging';
import { NextApiResponse } from 'next';

export function sendSSE(
    res: NextApiResponse,
    type: SSEEventType,
    payload: Record<string, any>
) {
    const data = JSON.stringify({ type, ...payload });
    res.write(`event: message\ndata: ${data}\n\n`);
    (res as any).flush?.();
}

export const createSSEEventHandler = (
    res: NextApiResponse,
    loggingContext: LoggingContext,
    options?: {
        onToken?: (token: string) => void;
        onComplete?: (event: any) => void;
    }
) => {
    return {
        [SSEEventType.STATUS]: (event: any) => {
            sendSSE(res, SSEEventType.STATUS, {
                message: event.message,
            });
        },
        [SSEEventType.TOKEN]: (event: any) => {
            sendSSE(res, SSEEventType.TOKEN, {
                content: event.content,
            });
            options?.onToken?.(event.content);
        },
        [SSEEventType.SOURCES]: (event: any) => {
            sendSSE(res, SSEEventType.SOURCES, {
                source_documents: event.source_documents,
            });
        },
        [SSEEventType.COMPLETE]: (event: any) => {
            options?.onComplete?.(event);
            logInfo('Received COMPLETE event', { ...loggingContext });
        },
        [SSEEventType.ERROR]: (event: any) => {
            logError('Received ERROR event', {
                error: event.error,
                ...loggingContext,
            });
            sendSSE(res, SSEEventType.ERROR, {
                error: event.error,
            });
            res.end();
        },
        default: (event: any) => {
            logError('Unknown SSE event type', {
                eventType: event?.type,
                ...loggingContext,
            });
        },
    };
};

export function handleSSEChunk(
    chunk: string,
    eventHandler: Record<string, (event: any) => void>,
    loggingContext: LoggingContext
) {
    const dataLine = chunk.split('\n').find((line) => line.startsWith('data:'));
    if (!dataLine) return;

    try {
        const jsonLine = dataLine.replace(/^data:\s*/, '');
        const event = JSON.parse(jsonLine);
        const handler =
            eventHandler[event.type as SSEEventType] ?? eventHandler.default;
        handler(event);
    } catch (error) {
        logError('Bad upstream SSE line', {
            ...parseErrorInformation(error),
            ...loggingContext,
            raw: chunk,
        });
    }
}
