import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { baseAppUrl } from '@deps/queries/api-config';
import {
    BOT_ERROR_MESSAGE_ID,
    MessageRole,
    SSEEventType,
} from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';
import { SourceDocument } from '@zinnia/api-types/types/knowledgebase';

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
          definitiveAnswerFound?: boolean;
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
    const {
        selectedClientId,
        setCurrentMessages,
        currentMessages,
        commonClientId,
    } = useKnowledgeBaseContext();
    const [status, setStatus] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [sources, setSources] = useState<SourceDocument[]>([]);
    const [questionId, setQuestionId] = useState<string | null>(null);
    const [responseId, setResponseId] = useState<string | null>(null);
    const [followUpId, setFollowUpId] = useState<string | null>(null);
    const [definitiveAnswerFound, setDefinitiveAnswerFound] = useState<
        boolean | null
    >(null);
    const botMsgIdRef = useRef<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const setErrorMessage = useCallback(
        (id: string) => {
            setCurrentMessages((prev) =>
                prev.map((msg) =>
                    msg.id === id
                        ? {
                              id: BOT_ERROR_MESSAGE_ID,
                              role: MessageRole.Bot,
                              content: t('chat.errorMsg'),
                          }
                        : msg
                )
            );
        },
        [setCurrentMessages, t]
    );

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
                                onComplete?.(
                                    parsedData as CompleteEvent,
                                    source_documents
                                );
                                eventSource.close();
                                setIsStreaming(false);
                                if (assignRef) eventSourceRef.current = null;
                                break;

                            case SSEEventType.ERROR:
                                onError?.(parsedData.error);
                                eventSource.close();
                                setIsStreaming(false);
                                if (assignRef) eventSourceRef.current = null;
                                setErrorMessage(botMsgIdRef.current || '');
                                break;
                        }
                    } catch (error) {
                        browserLogError(
                            `Error parsing SSE data: ${logPrefix}`,
                            event.data
                        );
                        setResponse(t('chat.errorMsg') || '');
                        setIsStreaming(false);
                        if (assignRef) eventSourceRef.current = null;
                        eventSource.close();
                        setErrorMessage(botMsgIdRef.current || '');
                    }
                };

                eventSource.onerror = (err) => {
                    browserLogError(`SSE error: ${logPrefix}`, err);
                    setResponse(t('chat.errorMsg') || '');
                    eventSource.close();
                    setIsStreaming(false);
                    if (assignRef) eventSourceRef.current = null;
                    setErrorMessage(botMsgIdRef.current || '');
                };
            } catch (error: any) {
                browserLogError(`Error opening SSE: ${logPrefix}`, error);
                setResponse(t('chat.errorMsg') || '');
                setIsStreaming(false);
                if (assignRef) eventSourceRef.current = null;
                setErrorMessage(botMsgIdRef.current || '');
            }
        },
        [t, setErrorMessage]
    );

    const resetData = () => {
        setIsStreaming(true);
        setResponse('');
        setStatus(null);
        setSources([]);
        setQuestionId(null);
        setResponseId(null);
        setFollowUpId(null);
        setDefinitiveAnswerFound(null);
    };

    const sendMessage = useCallback(
        async (sessionId: string, question: string, userMsgId: string) => {
            resetData();
            const botMsgId = uuidv4();
            botMsgIdRef.current = botMsgId;
            setCurrentMessages((prev) => [
                ...prev,
                {
                    id: botMsgId,
                    role: MessageRole.Bot,
                    content: '',
                },
            ]);

            const queryParams = new URLSearchParams({
                sessionId,
                question,
                clientId,
            }).toString();

            const url = `${baseAppUrl}/api/knowledge-base/chat-stream?${queryParams}`;
            let hasClearedAfterStatus = false;

            initSSE({
                url,
                logPrefix: 'sendMessage',
                onStatus: (status) => {
                    setStatus(status);
                    setCurrentMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId
                                ? {
                                      ...msg,
                                      content: status,
                                  }
                                : msg
                        )
                    );
                },
                onToken: (chunk) => {
                    if (!hasClearedAfterStatus) {
                        setCurrentMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === botMsgId
                                    ? {
                                          ...msg,
                                          content: '',
                                      }
                                    : msg
                            )
                        );
                        hasClearedAfterStatus = true;
                    }
                    setResponse((prev) => (prev ?? '') + chunk);
                    setCurrentMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId
                                ? {
                                      ...msg,
                                      content: (msg.content ?? '') + chunk,
                                  }
                                : msg
                        )
                    );
                },
                onComplete: (data, docs) => {
                    setResponse(data.full_response);
                    setSources(docs);
                    setQuestionId(data.questionId ?? null);
                    setResponseId(data.responseId ?? null);
                    if (selectedClientId !== commonClientId) {
                        setDefinitiveAnswerFound(
                            data.definitiveAnswerFound ?? null
                        );
                    }
                    setCurrentMessages((prev) =>
                        prev.map((msg) => {
                            if (msg.id === botMsgId) {
                                return {
                                    ...msg,
                                    content: data.full_response,
                                    ...(data.definitiveAnswerFound === false
                                        ? { sourceDocuments: [] }
                                        : { sourceDocuments: docs }),
                                    id: data.responseId ?? botMsgId,
                                    questionId: data.questionId,
                                    ...(selectedClientId !== commonClientId && {
                                        definitiveAnswerFound:
                                            data.definitiveAnswerFound,
                                    }),
                                };
                            }
                            if (msg.id === userMsgId) {
                                return {
                                    ...msg,
                                    id: data.questionId ?? userMsgId,
                                };
                            }
                            return msg;
                        })
                    );
                },
                onError: () => {
                    setResponse(t('chat.errorMsg') || '');
                    setSources([]);
                    setErrorMessage(botMsgId);
                },
            });
        },
        [
            clientId,
            initSSE,
            t,
            setCurrentMessages,
            selectedClientId,
            setErrorMessage,
            commonClientId,
        ]
    );

    const sendFollowUp = useCallback(
        async (
            questionId: string,
            followUpQuestion: string,
            parentFollowUpId?: string | null
        ) => {
            resetData();
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
                    if (data.definitiveAnswerFound === false) {
                        setSources([]);
                    } else {
                        setSources(docs);
                    }
                    setFollowUpId(data.followUpID ?? null);
                    if (selectedClientId !== commonClientId) {
                        setDefinitiveAnswerFound(
                            data.definitiveAnswerFound ?? null
                        );
                    }
                },
                onError: () => {
                    setResponse(t('chat.errorMsg') || '');
                    setSources([]);
                },
            });
        },
        [selectedClientId, initSSE, t, commonClientId]
    );

    const getCommonClientResponse = useCallback(
        async (sessionId: string, questionId: string, messageId: string) => {
            resetData();
            setCurrentMessages((prev) => prev.slice(0, -1));

            const question =
                currentMessages.find((msg) => msg.id === questionId)?.content ??
                '';
            const botMsgId = uuidv4();
            botMsgIdRef.current = botMsgId;
            setCurrentMessages((prev) => [
                ...prev,
                {
                    id: botMsgId,
                    role: MessageRole.Bot,
                    content: '',
                },
            ]);

            const queryParams = new URLSearchParams({
                sessionId,
                question,
                messageId,
                commonClientId: commonClientId || '',
            }).toString();

            const url = `${baseAppUrl}/api/knowledge-base/common-client-response?${queryParams}`;
            let hasClearedAfterStatus = false;

            initSSE({
                url,
                logPrefix: 'getCommonClientResponse',
                onStatus: (status) => {
                    setStatus(status);
                    setCurrentMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId
                                ? {
                                      ...msg,
                                      content: status,
                                  }
                                : msg
                        )
                    );
                },
                onToken: (chunk) => {
                    if (!hasClearedAfterStatus) {
                        setCurrentMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === botMsgId
                                    ? {
                                          ...msg,
                                          content: '',
                                      }
                                    : msg
                            )
                        );
                        hasClearedAfterStatus = true;
                    }
                    setResponse((prev) => (prev ?? '') + chunk);
                    setCurrentMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId
                                ? {
                                      ...msg,
                                      content: (msg.content ?? '') + chunk,
                                  }
                                : msg
                        )
                    );
                },
                onComplete: (data, docs) => {
                    setResponse(data.full_response);
                    setSources(docs);
                    setQuestionId(data.questionId ?? null);
                    setResponseId(data.responseId ?? null);
                    setCurrentMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId
                                ? {
                                      ...msg,
                                      content: data.full_response,
                                      ...(data.definitiveAnswerFound === false
                                          ? { sourceDocuments: [] }
                                          : { sourceDocuments: docs }),
                                      id: data.responseId ?? botMsgId,
                                      questionId: data.questionId,
                                  }
                                : msg
                        )
                    );
                },
                onError: () => {
                    setResponse(t('chat.errorMsg') || '');
                    setSources([]);
                    setErrorMessage(botMsgId);
                },
            });
        },
        [
            initSSE,
            t,
            currentMessages,
            setCurrentMessages,
            setErrorMessage,
            commonClientId,
        ]
    );

    const getCommonClientFollowUp = useCallback(
        async (followUpId: string, followUpQuestion: string) => {
            resetData();
            const queryParams = new URLSearchParams({
                followUpId,
                followUpQuestion,
                commonClientId: commonClientId || '',
            }).toString();

            const url = `${baseAppUrl}/api/knowledge-base/follow-up/commonClientFollowUp?${queryParams}`;

            initSSE({
                url,
                logPrefix: 'commonClientFollowUp',
                onStatus: setStatus,
                onToken: (c) => setResponse((prev) => (prev ?? '') + c),
                onComplete: (data, docs) => {
                    setResponse(data.full_response);
                    if (data.definitiveAnswerFound === false) {
                        setSources([]);
                    } else {
                        setSources(docs);
                    }
                },
                onError: () => {
                    setResponse(t('chat.errorMsg') || '');
                    setSources([]);
                },
            });
        },
        [initSSE, t, commonClientId]
    );

    const stopStreaming = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsStreaming(false);
        }
    }, []);

    return {
        response,
        status,
        sources,
        isStreaming,
        questionId,
        responseId,
        followUpId,
        definitiveAnswerFound,
        sendMessage,
        sendFollowUp,
        stopStreaming,
        getCommonClientResponse,
        getCommonClientFollowUp,
    };
};
