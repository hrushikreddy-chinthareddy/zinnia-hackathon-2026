import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';
import { Loader } from '@zinnia/bloom/components';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import {
    createNewChatSession,
    getChatbotResponse,
} from '@deps/queries/api/knowledge-base';
import {
    BOT_ERROR_MESSAGE_ID,
    ChatbotMessage,
    KeyboardEvents,
    MessageRole,
    UserMessage,
} from '@deps/types/knowledge-base';
import { browserLogError, browserLogTrace } from '@deps/utils/browser-logging';

import styles from './chat-input.module.css';

type ChatInputProps = {
    opsUserData: MeResponse;
};

const ABORT_ERROR = 'AbortError';

const ChatInput = ({ opsUserData }: ChatInputProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const {
        sessionId,
        setSessionId,
        selectedClientId,
        setCurrentMessages,
        setChatHistoryReloadTrigger,
        currentMessages,
    } = useKnowledgeBaseContext();
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastMessage = useRef<string | null>(null);

    const handleMessageSend = async (message: string) => {
        if (!message.trim()) return;
        let currentSessionId = sessionId;
        try {
            abortControllerRef.current = new AbortController();
            setLoading(true);
            setMessage('');
            const userMessage: UserMessage = {
                id: uuidv4(),
                role: MessageRole.User,
                content: message,
            };
            setCurrentMessages((prev: any) => [...prev, userMessage]);
            lastMessage.current = message;
            let newSession = false;
            if (!sessionId) {
                const newChatSession = await createNewChatSession(
                    opsUserData.email || '',
                    selectedClientId,
                    message.trim()
                );
                if (!newChatSession || !newChatSession.sessionId) {
                    browserLogError('Failed to create new chat session', {
                        email: opsUserData.email,
                        clientId: selectedClientId,
                    });
                    setLoading(false);
                    return;
                }
                currentSessionId = newChatSession.sessionId;
                setSessionId(newChatSession.sessionId);
                newSession = true;
            }
            const chatbotResponse = await getChatbotResponse(
                currentSessionId,
                message,
                selectedClientId,
                abortControllerRef.current.signal
            );
            if (chatbotResponse) {
                const chatbotMessage: ChatbotMessage = {
                    id: chatbotResponse.responseId,
                    questionId: chatbotResponse.questionId,
                    role: MessageRole.Bot,
                    content: chatbotResponse.response,
                    sourceDocuments: chatbotResponse.sourceDocuments,
                    feedbackType: chatbotResponse.feedbackType,
                    feedbackComment: chatbotResponse.feedbackComment,
                };
                setCurrentMessages((prev: any) => {
                    const prevMessages = [...prev];
                    prevMessages[prevMessages.length - 1] = {
                        ...prevMessages[prevMessages.length - 1],
                        id: chatbotResponse.questionId,
                    };
                    return [...prevMessages, chatbotMessage];
                });
                if (newSession) {
                    setChatHistoryReloadTrigger((prev: any) => prev + 1);
                }
            } else {
                browserLogError('Error getting response from chatbot', {
                    sessionId: currentSessionId,
                });
                setCurrentMessages((prev: any) => [
                    ...prev,
                    {
                        id: BOT_ERROR_MESSAGE_ID,
                        role: MessageRole.Bot,
                        content: t('chat.errorMsg'),
                    },
                ]);
            }
        } catch (error: any) {
            if (error.name === ABORT_ERROR) {
                browserLogTrace('Chatbot response request cancelled');
                return;
            }
            browserLogError('Error sending message::', { error });
            return;
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleStopResponse = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
        }
    };

    const retryLastMessage = () => {
        if (!lastMessage.current) return;
        setCurrentMessages((prev: any) => prev.slice(0, prev.length - 2));
        handleMessageSend(lastMessage.current);
    };

    return (
        <>
            {loading && (
                <div className="text-center my-4 mx-auto">
                    <Loader />
                </div>
            )}
            <div className="w-full">
                <div className={`${styles.textboxContainer}`}>
                    <textarea
                        className={`!outline-none !ring-0 ${styles.textarea}`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === KeyboardEvents.Enter) {
                                handleMessageSend(message);
                            }
                        }}
                        disabled={loading}
                        placeholder={t('chat.inputPlaceholder') || ''}
                    ></textarea>

                    <div className="flex gap-2">
                        {loading ? (
                            <button
                                aria-label="stop-button"
                                type="button"
                                onClick={() => handleStopResponse()}
                            >
                                {t('chat.stop')}
                            </button>
                        ) : (
                            <button
                                aria-label="send-button"
                                type="button"
                                onClick={() => handleMessageSend(message)}
                            >
                                {t('chat.send')}
                            </button>
                        )}
                        {currentMessages?.find(
                            (message: any) =>
                                message.id === BOT_ERROR_MESSAGE_ID
                        ) && (
                            <button
                                aria-label="retry-button"
                                type="button"
                                onClick={() => retryLastMessage()}
                            >
                                {t('chat.retry')}
                            </button>
                        )}
                    </div>
                </div>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className="text-center mt-4 text-gray-400"
                >
                    {t('chat.footerText')}
                </Typography>
            </div>
        </>
    );
};

export default ChatInput;
