import { Loader, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import ChatResponse from '@deps/components/knowledge-base/chat/chat-response/chat-response';
import { TranslationFiles } from '@deps/config/translations';
import { useChatStream } from '@deps/hooks/knowledge-base/useChatStream';
import { useScroll } from '@deps/hooks/useScroll';
import { getFollowupMessages } from '@deps/queries/api/knowledge-base';
import {
    AnswerMode,
    ChatbotMessage,
    FeedbackType,
    KeyboardEvents,
    MessageRole,
    UserMessage,
} from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';
import { SourceDocument } from '@zinnia/api-types/types/knowledgebase';

import styles from './follow-up.module.css';
import ActionButton from '../action-button/action-button';
import AnswerModeSelect from '../answer-mode-select/answer-mode-select';
import ChatQuestion from '../chat-question/chat-question';

type FollowUpProps = {
    email: string;
    questionId: string;
    responseId: string;
    response: string;
    sourceDocuments?: SourceDocument[];
    submittedFeedbackType?: FeedbackType | null;
    submittedFeedbackComment?: string | null;
    selectedClientId: string;
    commonClientId: string;
};
type FollowUpChainMessage = {
    id: string;
    user: UserMessage;
    chatbot?: ChatbotMessage;
};

const FollowUp = ({
    email,
    questionId,
    responseId,
    response,
    sourceDocuments = [],
    submittedFeedbackType = null,
    submittedFeedbackComment = null,
    selectedClientId,
    commonClientId,
}: FollowUpProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const {
        response: chatbotResponse,
        status,
        sources,
        isStreaming,
        followUpId,
        sendFollowUp,
        stopStreaming,
        definitiveAnswerFound,
        getCommonClientFollowUp,
    } = useChatStream(selectedClientId, commonClientId);
    const [loading, setLoading] = useState<boolean>(false);
    const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
    const [followUpChain, setFollowUpChain] = useState<FollowUpChainMessage[]>(
        []
    );
    const [totalFollowUps, setTotalFollowUps] = useState<number>(0);
    const [parentFollowUpId, setParentFollowUpId] = useState<string | null>(
        null
    );
    const { handleContainerScroll, scrollContainerRef, endref } =
        useScroll(followUpChain);
    const botMsgIdRef = useRef<string | null>(null);
    const [answerMode, setAnswerMode] = useState<AnswerMode>(AnswerMode.Short);

    const MAX_FOLLOWUPS_ALLOWED = 5;

    useEffect(() => {
        const botId = botMsgIdRef.current;
        if (!botId) return;

        setFollowUpChain((prev) => {
            const newChatbotResponse = {
                id: botId,
                role: MessageRole.Bot,
                content:
                    (chatbotResponse && chatbotResponse.length > 0
                        ? chatbotResponse
                        : status) || '',
                sourceDocuments: sources || [],
                ...(definitiveAnswerFound === false && {
                    definitiveAnswerFound,
                }),
            };
            return prev.map((m) =>
                m.chatbot?.id === botId
                    ? { ...m, chatbot: newChatbotResponse as ChatbotMessage }
                    : m
            );
        });

        if (!isStreaming && botId) {
            if (followUpId && followUpId.length > 1) {
                setParentFollowUpId(followUpId);
                setFollowUpChain((prev) =>
                    prev.map((m) =>
                        m.chatbot?.id === botId
                            ? {
                                  ...m,
                                  chatbot: { ...m.chatbot, id: followUpId },
                              }
                            : m
                    )
                );
            }
            botMsgIdRef.current = null;
            setTotalFollowUps(followUpChain.length);
        }
    }, [
        chatbotResponse,
        status,
        sources,
        isStreaming,
        followUpId,
        definitiveAnswerFound,
        followUpChain,
    ]);

    const handleFollowUpQuestionSend = async () => {
        if (!followUpQuestion.trim()) return;

        try {
            const userMessage: UserMessage = {
                id: uuidv4(),
                role: MessageRole.User,
                content: followUpQuestion,
            };

            setFollowUpChain((prev) => [
                ...prev,
                { id: userMessage.id, user: userMessage },
            ]);
            setFollowUpQuestion('');
            await sendFollowUp(
                questionId,
                userMessage.content,
                answerMode,
                parentFollowUpId
            );
            const botMsgId = uuidv4();
            botMsgIdRef.current = botMsgId;
            const chatbotMessage = {
                id: botMsgId,
                role: MessageRole.Bot,
                content: '',
                sourceDocuments: [],
            };

            setFollowUpChain((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    chatbot: chatbotMessage as ChatbotMessage,
                };
                return updated;
            });
        } catch (error: any) {
            browserLogError('Failed to send follow up question', error);
        }
    };

    const searchCommonClientFollowUp = async () => {
        const lastFollowUp = followUpChain[followUpChain.length - 1];
        if (!lastFollowUp) return;
        botMsgIdRef.current = lastFollowUp?.chatbot?.id ?? '';

        setFollowUpChain((prev) =>
            prev.map((msg) => {
                if (msg.id === lastFollowUp?.id) {
                    const { chatbot, ...rest } = msg;
                    return rest;
                }
                return msg;
            })
        );
        await getCommonClientFollowUp(
            botMsgIdRef.current,
            lastFollowUp?.user?.content,
            answerMode
        );

        const chatbotMessage: ChatbotMessage = {
            id: botMsgIdRef.current ?? '',
            role: MessageRole.Bot,
            content: '',
            sourceDocuments: [],
        };
        setFollowUpChain((prev) =>
            prev.map((msg) =>
                msg.id === lastFollowUp.id
                    ? { ...msg, chatbot: chatbotMessage }
                    : msg
            )
        );
    };

    const handleStopResponse = () => {
        stopStreaming();
    };

    useEffect(() => {
        const fetchFollowUp = async () => {
            setLoading(true);
            try {
                const response = await getFollowupMessages(questionId);
                if (response) {
                    setTotalFollowUps(response?.totalFollowUps || 0);
                    const followUpMessages: {
                        id: string;
                        user: UserMessage;
                        chatbot?: ChatbotMessage;
                    }[] = [];
                    response.followUpChain?.forEach((message) => {
                        const {
                            followUpId,
                            followUpQuestion,
                            followUpAnswer,
                            sourceDocuments,
                            definitiveAnswerFound,
                        } = message;
                        const userMessage: UserMessage = {
                            id: followUpId ?? '',
                            role: MessageRole.User,
                            content: followUpQuestion ?? '',
                        };
                        const chatbotMessage: ChatbotMessage = {
                            id: followUpId ?? '',
                            questionId,
                            role: MessageRole.Bot,
                            content: followUpAnswer ?? '',
                            sourceDocuments:
                                definitiveAnswerFound === false
                                    ? []
                                    : sourceDocuments,
                            feedbackType: null,
                            feedbackComment: null,
                        };
                        followUpMessages.push({
                            id: followUpId ?? '',
                            user: userMessage,
                            chatbot: chatbotMessage,
                        });
                    });
                    setFollowUpChain(followUpMessages);
                    setParentFollowUpId(
                        response.followUpChain?.[
                            response.followUpChain.length - 1
                        ].followUpId || null
                    );
                }
            } catch (error) {
                browserLogError('Error fetching followup messages');
            } finally {
                setLoading(false);
            }
        };
        fetchFollowUp();
    }, [questionId]);

    return (
        <div
            className="w-full p-4 flex flex-col gap-4 h-full"
            data-testid="followup-modal"
        >
            {loading ? (
                <div className="h-[720px] w-full flex justify-center items-center">
                    <Loader />
                </div>
            ) : (
                <>
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleContainerScroll}
                        className={`h-[720px] overflow-y-auto`}
                    >
                        <ChatResponse
                            email={email}
                            questionId={questionId}
                            responseId={responseId}
                            response={response}
                            sourceDocuments={sourceDocuments}
                            submittedFeedbackType={submittedFeedbackType}
                            submittedFeedbackComment={submittedFeedbackComment}
                            showFeedbackControls={false}
                            isStreaming={false}
                        />
                        {followUpChain && (
                            <div>
                                {followUpChain?.map((message, index) => {
                                    const { id, user, chatbot } = message;
                                    return (
                                        <div
                                            key={id}
                                            className="mt-6 flex flex-col gap-4"
                                        >
                                            <ChatQuestion
                                                question={user?.content}
                                            />
                                            {chatbot && (
                                                <ChatResponse
                                                    email={email}
                                                    questionId={questionId}
                                                    responseId={chatbot.id}
                                                    response={chatbot.content}
                                                    sourceDocuments={
                                                        chatbot.sourceDocuments
                                                    }
                                                    submittedFeedbackType={null}
                                                    submittedFeedbackComment={
                                                        null
                                                    }
                                                    showFeedbackControls={false}
                                                    isFollowUp={true}
                                                    searchCommonClientFollowUp={
                                                        searchCommonClientFollowUp
                                                    }
                                                    definitiveAnswerFound={
                                                        chatbot.definitiveAnswerFound
                                                    }
                                                    isStreaming={
                                                        index !==
                                                        followUpChain.length - 1
                                                            ? false
                                                            : isStreaming
                                                    }
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={endref} />
                            </div>
                        )}
                    </div>

                    <div className={`${styles.textboxContainer}`}>
                        <div className="w-full flex flex-col">
                            <textarea
                                className={`!outline-none !ring-0 ${styles.textarea}`}
                                value={followUpQuestion}
                                onChange={(e) =>
                                    setFollowUpQuestion(e.target.value)
                                }
                                rows={2}
                                onKeyDown={(e) => {
                                    if (e.key === KeyboardEvents.Enter) {
                                        handleFollowUpQuestionSend();
                                    }
                                }}
                                disabled={
                                    isStreaming ||
                                    totalFollowUps >= MAX_FOLLOWUPS_ALLOWED
                                }
                                placeholder={
                                    t('chat.followUpPlaceholder') || ''
                                }
                            ></textarea>
                            <AnswerModeSelect
                                isStreaming={isStreaming}
                                modeSelected={answerMode}
                                onModeSelectedChange={setAnswerMode}
                            />
                        </div>
                        <Tooltip
                            placement={TooltipPlacement.CenterLeft}
                            triggerClassName="!w-auto w-fit"
                            tooltipClassName="!w-auto !p-0 !px-2 z-50"
                            triggerAriaLabel={t('chat.send') || 'Send'}
                            trigger={
                                <ActionButton
                                    ariaLabel="send-followup"
                                    message={followUpQuestion}
                                    disabled={
                                        totalFollowUps >=
                                            MAX_FOLLOWUPS_ALLOWED ||
                                        (!isStreaming &&
                                            !followUpQuestion.trim())
                                    }
                                    isStreaming={isStreaming}
                                    handleMessageSend={
                                        handleFollowUpQuestionSend
                                    }
                                    handleStopResponse={handleStopResponse}
                                />
                            }
                        >
                            {t('chat.send')}
                        </Tooltip>
                    </div>
                </>
            )}
        </div>
    );
};

export default FollowUp;
