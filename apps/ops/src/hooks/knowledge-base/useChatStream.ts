import { SourceDocument } from '@xd/api-types/dist/generated-types/knowledgebase';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { baseAppUrl } from '@deps/queries/api-config';
import { SSEEventType } from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';

type ChatEvent =
  | { type: SSEEventType.STATUS; message: string }
  | { type: SSEEventType.TOKEN; content: string }
  | { type: SSEEventType.SOURCES; source_documents: SourceDocument[] }
  | {
    type: SSEEventType.COMPLETE;
    full_response: string;
    questionId?: string;
    responseId?: string;
    followUpID?: string;
  }
  | { type: SSEEventType.ERROR; error: string };

type CompleteEvent = Extract<ChatEvent, { type: SSEEventType.COMPLETE }>;
type ErrorEvent = Extract<ChatEvent, { type: SSEEventType.ERROR }>;

type SSEConfig = {
  url: string;
  logPrefix: string;
  onStatus?: (msg: string) => void;
  onToken?: (content: string) => void;
  onSources?: (docs: SourceDocument[]) => void;
  onComplete?: (data: CompleteEvent, docs: SourceDocument[]) => void;
  onError?: (err: ErrorEvent['error']) => void;
  assignRef?: boolean;
};

export const useChatStream = (clientId: string) => {
  const { t } = useTranslation(TranslationFiles.COMMON, {
    keyPrefix: 'zinniaAiAssistant',
  });
  const { selectedClientId } = useKnowledgeBaseContext();
  const [status, setStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [followUpId, setFollowUpId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const isStreamingRef = useRef(isStreaming);
  const setIsStreamingSafe = (v: boolean) => {
    isStreamingRef.current = v;
    setIsStreaming(v);
  };

  const initSSE = useCallback(
    ({
      url,
      logPrefix,
      onStatus,
      onToken,
      onSources,
      onComplete,
      onError,
      assignRef = true,
    }: SSEConfig) => {
      try {
        const eventSource = new EventSource(url);
        let source_documents: SourceDocument[] = [];

        if (assignRef) eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data) as ChatEvent;

            switch (parsedData.type) {
              case SSEEventType.STATUS:
                onStatus?.(parsedData.message);
                break;

              case SSEEventType.TOKEN:
                onToken?.(parsedData.content);
                break;

              case SSEEventType.SOURCES:
                source_documents = parsedData.source_documents;
                onSources?.(source_documents);
                break;

              case SSEEventType.COMPLETE:
                onComplete?.(parsedData as CompleteEvent, source_documents);
                eventSource.close();
                setIsStreamingSafe(false);
                if (assignRef) eventSourceRef.current = null;
                break;

              case SSEEventType.ERROR:
                onError?.(parsedData.error);
                eventSource.close();
                setIsStreamingSafe(false);
                if (assignRef) eventSourceRef.current = null;
                break;
            }
          } catch (error) {
            browserLogError(`Error parsing SSE data: ${logPrefix}`, event.data);
            setResponse(t('chat.errorMsg') || '');
            setIsStreamingSafe(false);
            if (assignRef) eventSourceRef.current = null;
            eventSource.close();
          }
        };

        eventSource.onerror = (err) => {
          browserLogError(`SSE error: ${logPrefix}`, err);
          setResponse(t('chat.errorMsg') || '');
          eventSource.close();
          setIsStreamingSafe(false);
          if (assignRef) eventSourceRef.current = null;
        };

      } catch (error: any) {
        browserLogError(`Error opening SSE: ${logPrefix}`, error);
        setResponse(t('chat.errorMsg') || '');
        setIsStreamingSafe(false);
        if (assignRef) eventSourceRef.current = null;
      }
    },
    [t]
  );

  const sendMessage = useCallback(
    async (sessionId: string, question: string) => {
      setIsStreamingSafe(true);
      setResponse('');
      setStatus(null);
      setSources([]);
      setQuestionId(null);
      setResponseId(null);

      const queryParams = new URLSearchParams({
        sessionId,
        question,
        clientId,
      }).toString();

      const url = `${baseAppUrl}/api/knowledge-base/chat-stream?${queryParams}`;

      initSSE({
        url,
        logPrefix: 'sendMessage',
        onStatus: setStatus,
        onToken: (c) => setResponse((prev) => (prev ?? '') + c),
        onComplete: (data, docs) => {
          setResponse(data.full_response);
          setSources(docs);
          setQuestionId(data.questionId ?? null);
          setResponseId(data.responseId ?? null);
        },
        onError: () => {
          setResponse(t('chat.errorMsg') || '');
          setSources([]);
        },
      });
    },
    [clientId, initSSE, t]
  );

  const sendFollowUp = useCallback(
    async (
      questionId: string,
      followUpQuestion: string,
      parentFollowUpId?: string | null
    ) => {
      setIsStreamingSafe(true);
      setResponse('');
      setStatus(null);
      setSources([]);
      setFollowUpId(null);

      const queryParams = new URLSearchParams({
        messageId: questionId,
        followUpQuestion,
        parentFollowUpId: parentFollowUpId ?? '',
        clientId: selectedClientId,
      }).toString();

      const url = `${baseAppUrl}/api/knowledge-base/follow-up/sendFollowUpStream?${queryParams}`;

      initSSE({
        url,
        logPrefix: 'sendFollowUp',
        onStatus: setStatus,
        onToken: (c) => setResponse((prev) => (prev ?? '') + c),
        onComplete: (data, docs) => {
          setResponse(data.full_response);
          setSources(docs);
          setFollowUpId(data.followUpID ?? null);
        },
        onError: () => {
          setResponse(t('chat.errorMsg') || '');
          setSources([]);
        },
      });
    },
    [selectedClientId, initSSE, t]
  );

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreamingSafe(false);
    }
  }, []);

  return {
    response,
    status,
    sources,
    isStreaming,
    isStreamingRef,
    questionId,
    responseId,
    followUpId,
    sendMessage,
    sendFollowUp,
    stopStreaming,
  };
};