import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';
import { Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import Button from '@deps/components/button/button';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { useChatStream } from '@deps/hooks/knowledge-base/useChatStream';
import { createNewChatSession } from '@deps/queries/api/knowledge-base';
import { ReactComponent as SendButton } from '@deps/styles/elements/icons/knowledge-base/send.svg';
import { ReactComponent as StopButton } from '@deps/styles/elements/icons/knowledge-base/stop.svg';
import {
    BOT_ERROR_MESSAGE_ID,
    KeyboardEvents,
    MessageRole,
    UserMessage,
} from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';

import styles from './chat-input.module.css';

type ChatInputProps = {
    opsUserData: MeResponse;
    setIsCompleted: (isCompleted: boolean) => void;
};

const ChatInput = ({
    opsUserData,
    setIsCompleted,
}: ChatInputProps) => {
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

    const lastMessage = useRef<string | null>(null);
    const botMsgIdRef = useRef<string | null>(null);

    const {
        response,
        status,
        sources,
        isStreaming,
        questionId,
        responseId,
        sendMessage,
        stopStreaming,
        isStreamingRef,
    } = useChatStream(selectedClientId);

    useEffect(() => {
        if (!botMsgIdRef.current) return;
        if (sources.length >= 1) setLoading(false);
        setCurrentMessages(prev =>
            prev.map(m =>
                m.id === botMsgIdRef.current
                    ? {
                        ...m,
                        content:
                            (response && response.length > 0
                                ? response
                                : status) || '',
                        sourceDocuments: sources || [],
                        ...(questionId && { questionId }),
                        ...(responseId && { id: responseId ?? botMsgIdRef.current }),
                    }
                    : m
            )
        );
    }, [
        response,
        setCurrentMessages,
        status,
        sources,
        questionId,
        responseId,
    ]);

    useEffect(() => {
        setIsCompleted(!isStreamingRef.current);
    }, [isStreaming, setIsCompleted]);

    const handleMessageSend = async (message: string) => {
        if (!message.trim()) return;
        if (isStreaming || loading) return;
        let currentSessionId = sessionId;
        setLoading(true);
        try {
            setMessage('');
            const userMessage: UserMessage = {
                id: uuidv4(),
                role: MessageRole.User,
                content: message,
            };
            setCurrentMessages(prev => [...prev, userMessage]);
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

            await sendMessage(currentSessionId, message);
            const botMsgId = uuidv4();
            botMsgIdRef.current = botMsgId;
            setCurrentMessages(prev => [
                ...prev,
                {
                    id: botMsgId,
                    role: MessageRole.Bot,
                    content: '',
                },
            ]);

            if (newSession) {
                setChatHistoryReloadTrigger(prev => prev + 1);
            }
        } catch (error: any) {
            browserLogError('Error sending message::', { error });

            setCurrentMessages(prev => [
                ...prev,
                {
                    id: BOT_ERROR_MESSAGE_ID,
                    role: MessageRole.Bot,
                    content: t('chat.errorMsg'),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleStopResponse = () => {
        stopStreaming();
        setLoading(false);
    };

    const retryLastMessage = () => {
        if (!lastMessage.current) return;
        setCurrentMessages(prev => prev.slice(0, prev.length - 2));
        handleMessageSend(lastMessage.current);
    };

    return (
        <>
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
                        disabled={isStreaming || loading}
                        placeholder={t('chat.inputPlaceholder') || ''}
                    ></textarea>

                    <div className="flex gap-2">
                        {isStreaming ? (
                            <Tooltip
                                placement={TooltipPlacement.CenterRight}
                                triggerClassName="!w-auto"
                                tooltipClassName="!w-auto !p-0 !px-2"
                                trigger={
                                    <Button
                                        aria-label="stop-button"
                                        className="!bg-transparent !border-none !pl-2 !p-0"
                                        onClick={() => handleStopResponse()}
                                    >
                                        <StopButton
                                            className={`!w-[30px] text-gray-700`}
                                        />
                                    </Button>
                                }
                            >
                                {t('chat.stop')}
                            </Tooltip>
                        ) : (
                            <Tooltip
                                placement={TooltipPlacement.CenterRight}
                                triggerClassName="!w-auto"
                                tooltipClassName="!w-auto !p-0 !px-2"
                                trigger={
                                    <Button
                                        aria-label="send-button"
                                        className="!bg-transparent !border-none !pl-2 !p-0"
                                        onClick={() =>
                                            handleMessageSend(message)
                                        }
                                    >
                                        <SendButton
                                            className={`!w-[30px] transition-all duration-300 ${isStreaming ||
                                                loading ||
                                                !message.trim()
                                                ? 'text-gray-400'
                                                : 'text-gray-700'
                                                }`}
                                        />
                                    </Button>
                                }
                            >
                                {t('chat.send')}
                            </Tooltip>
                        )}
                        {currentMessages?.find(
                            message =>
                                message.content === t('chat.errorMsg')
                        ) && (
                                <button
                                    aria-label="retry-button"
                                    type="button"
                                    onClick={retryLastMessage}
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