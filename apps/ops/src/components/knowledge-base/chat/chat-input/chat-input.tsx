import clsx from 'clsx';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import SelectComponent from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { createNewChatSession } from '@deps/queries/api/knowledge-base';
import {
    AnswerMode,
    KeyboardEvents,
    MessageRole,
    UserMessage,
} from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';
import { MeResponse } from '@zinnia/api-types/types/knowledgebase';

import styles from './chat-input.module.css';
import ActionButton from '../action-button/action-button';
import AnswerModeSelect from '../answer-mode-select/answer-mode-select';

type ChatInputProps = {
    opsUserData: MeResponse;
    sendMessage: (
        sessionId: string,
        question: string,
        userMsgId: string,
        responseType: AnswerMode
    ) => void;
    stopStreaming: () => void;
    isStreaming: boolean;
};

const ChatInput = ({
    opsUserData,
    sendMessage,
    stopStreaming,
    isStreaming,
}: ChatInputProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const {
        sessionId,
        setSessionId,
        selectedClientId,
        setCurrentMessages,
        setSelectedClient,
        startNewChatSession,
        setChatHistoryReloadTrigger,
        currentMessages,
        answerMode,
        setAnswerMode,
    } = useKnowledgeBaseContext();
    const [message, setMessage] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const lastMessage = useRef<string | null>(null);

    const clientNameCleanup = (name: string) => {
        return name
            .replace(/\.aspx$/i, '')
            .replace(/-/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2');
    };

    const clientOptions =
        opsUserData?.client?.map((client) => {
            const clientOption = {
                value: client.id || '',
                textValue: client.name || '',
                label: clientNameCleanup(client?.name || ''),
            };
            return clientOption;
        }) || [];

    const handleClientChange = (clientId: string) => {
        setSelectedClient(clientId);
        startNewChatSession();
    };

    const handleMessageSend = async (message: string) => {
        if (!message.trim()) return;
        if (isStreaming) return;
        let currentSessionId = sessionId;
        try {
            setMessage('');
            const userMsgId = uuidv4();
            const userMessage: UserMessage = {
                id: userMsgId,
                role: MessageRole.User,
                content: message,
            };
            setCurrentMessages((prev) => [...prev, userMessage]);
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
                    return;
                }
                currentSessionId = newChatSession.sessionId;
                setSessionId(newChatSession.sessionId);
                newSession = true;
            }

            await sendMessage(currentSessionId, message, userMsgId, answerMode);
            setMessage('');

            if (newSession) {
                setChatHistoryReloadTrigger((prev) => prev + 1);
            }
        } catch (error: any) {
            browserLogError('Error sending message::', { error });
        }
    };

    const handleStopResponse = () => {
        stopStreaming();
    };

    const retryLastMessage = () => {
        if (!lastMessage.current) return;
        setCurrentMessages((prev) => prev.slice(0, prev.length - 2));
        handleMessageSend(lastMessage.current);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-center bg-white">
                <div
                    className={clsx(
                        'relative w-full m-2',
                        styles.rainbowBorder,
                        {
                            [styles.rbActive]: !isFocused && !isStreaming,
                        }
                    )}
                >
                    <div className="relative z-10 h-full text-white">
                        <div className={`${styles.textboxContainer} flex-col`}>
                            <div className="w-full flex typography-content-body flex-row items-start justify-start">
                                <textarea
                                    className={`!outline-none bg-inherit !ring-0 ${styles.textarea}`}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === KeyboardEvents.Enter) {
                                            handleMessageSend(message);
                                        }
                                    }}
                                    disabled={isStreaming}
                                    placeholder={
                                        t('chat.inputPlaceholder') || ''
                                    }
                                ></textarea>
                            </div>
                            <div className="mt-3 flex flex-row justify-between w-full items-end">
                                <div className="flex gap-4 items-end">
                                    <SelectComponent
                                        className="block! !w-[200px]"
                                        value={selectedClientId}
                                        options={clientOptions}
                                        onChange={handleClientChange}
                                        label={t('chat.client') || ''}
                                        disabled={isStreaming}
                                    />
                                    <AnswerModeSelect
                                        isStreaming={isStreaming}
                                        modeSelected={answerMode}
                                        onModeSelectedChange={setAnswerMode}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <ActionButton
                                        disabled={
                                            !isStreaming && !message.trim()
                                        }
                                        message={message}
                                        isStreaming={isStreaming}
                                        handleMessageSend={handleMessageSend}
                                        handleStopResponse={handleStopResponse}
                                    />
                                    {currentMessages?.find(
                                        (message) =>
                                            message.content ===
                                            t('chat.errorMsg')
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
                        </div>
                    </div>
                </div>
            </div>
            <Typography
                variant={TypographyVariant.BodySm}
                className="text-center mt-2 mb-2 text-gray-400 !font-light"
            >
                {t('chat.footerText')}
            </Typography>
        </div>
    );
};

export default ChatInput;
