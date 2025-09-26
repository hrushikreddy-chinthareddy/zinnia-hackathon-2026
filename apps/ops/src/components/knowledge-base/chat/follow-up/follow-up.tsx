import { FollowUpResponse, SourceDocument } from '@xd/api-types/dist/generated-types/knowledgebase';
import { Loader, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import Button from '@deps/components/button/button';
import ChatResponse from '@deps/components/knowledge-base/chat/chat-response/chat-response';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { useChatStream } from '@deps/hooks/knowledge-base/useChatStream';
import { getFollowupMessages } from '@deps/queries/api/knowledge-base';
import { ReactComponent as SendButton } from '@deps/styles/elements/icons/knowledge-base/send.svg';
import {
    ChatbotMessage,
    FeedbackType,
    KeyboardEvents,
    MessageRole,
    UserMessage,
} from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';

import styles from './follow-up.module.css';
import ChatQuestion from '../chat-question/chat-question';

type FollowUpProps = {
    email: string;
    questionId: string;
    responseId: string;
    response: string;
    sourceDocuments?: SourceDocument[];
    submittedFeedbackType?: FeedbackType | null;
    submittedFeedbackComment?: string | null;
};
type FollowUpChainMessage = {
    id: string;
    user: UserMessage;
    chatbot?: ChatbotMessage;
}

const FollowUp = ({
    email,
    questionId,
    responseId,
    response,
    sourceDocuments = [],
    submittedFeedbackType = null,
    submittedFeedbackComment = null,
}: FollowUpProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const { selectedClientId } = useKnowledgeBaseContext();
    const {
        response: chatbotResponse,
        status,
        sources,
        isStreaming,
        followUpId,
        sendFollowUp,
    } = useChatStream(selectedClientId);
    const [loading, setLoading] = useState<boolean>(false);
    const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
    const [followUpChain, setFollowUpChain] = useState<FollowUpChainMessage[]>([]);
    const [totalFollowUps, setTotalFollowUps] = useState<number>(0);
    const [parentFollowUpId, setParentFollowUpId] = useState<string | null>(
        null
    );

    const endref = useRef<HTMLDivElement | null>(null);
    const botMsgIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!botMsgIdRef.current) return;
        setFollowUpChain(prev => {
            const newChatbotResponse = {
                id: botMsgIdRef.current,
                role: MessageRole.Bot,
                content:
                    (chatbotResponse && chatbotResponse.length > 0
                        ? chatbotResponse
                        : status) || '',
                sourceDocuments: sources || [],
            };
            return prev.map(m =>
                m.chatbot?.id === botMsgIdRef.current
                    ? { ...m, chatbot: newChatbotResponse as ChatbotMessage }
                    : m
            );
        });
        if (!isStreaming && botMsgIdRef.current) {
            setTotalFollowUps((prev) => prev + 1);
            if (followUpId && followUpId?.length > 1) {
                setParentFollowUpId(followUpId);
                setFollowUpChain(prev =>
                    prev.map((m) =>
                        m.chatbot?.id === botMsgIdRef.current
                            ? { ...m, chatbot: { ...m.chatbot, id: followUpId } }
                            : m
                    )
                );
            }
        }
    }, [chatbotResponse, status, sources, isStreaming, followUpId]);

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
                    response.followUpChain?.forEach((message: FollowUpResponse) => {
                        const {
                            followUpId,
                            followUpQuestion,
                            followUpAnswer,
                            sourceDocuments,
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
                            sourceDocuments: sourceDocuments,
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

    useEffect(() => {
        endref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [followUpChain]);

    return (
        <div
            className="w-full pt-4 flex flex-col gap-4 h-full"
            data-testid="followup-modal"
        >
            {loading ? (
                <div className="h-[720px] w-full flex justify-center items-center">
                    <Loader />
                </div>
            ) : (
                <>
                    <div className={`h-[720px] overflow-y-auto`}>
                        <ChatResponse
                            email={email}
                            questionId={questionId}
                            responseId={responseId}
                            response={response}
                            sourceDocuments={sourceDocuments}
                            submittedFeedbackType={submittedFeedbackType}
                            submittedFeedbackComment={submittedFeedbackComment}
                            showFeedbackControls={false}
                        />
                        {followUpChain && (
                            <div>
                                {followUpChain?.map(message => {
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
                        <textarea
                            className={`!outline-none !ring-0 ${styles.textarea}`}
                            value={followUpQuestion}
                            onChange={(e) =>
                                setFollowUpQuestion(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === KeyboardEvents.Enter) {
                                    handleFollowUpQuestionSend();
                                }
                            }}
                            disabled={isStreaming || totalFollowUps >= 5}
                            placeholder={t('chat.followUpPlaceholder') || ''}
                        ></textarea>
                        <Tooltip
                            placement={TooltipPlacement.CenterLeft}
                            triggerClassName="!w-auto"
                            tooltipClassName="!w-auto !p-0 !px-2 z-50"
                            trigger={
                                <Button
                                    aria-label="send-followup"
                                    className="!bg-transparent !border-none !pl-2 !p-0"
                                    onClick={handleFollowUpQuestionSend}
                                >
                                    <SendButton
                                        className={`!w-[30px] transition-all duration-300 ${isStreaming ||
                                            totalFollowUps >= 5 ||
                                            !followUpQuestion.trim()
                                            ? 'text-gray-400'
                                            : 'text-gray-700'
                                            }`}
                                    />
                                </Button>
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