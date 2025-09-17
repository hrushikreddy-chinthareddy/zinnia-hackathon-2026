import { SourceDocument } from '@xd/api-types/dist/generated-types/knowledgebase';
import { Loader } from '@zinnia/bloom/components';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ChatResponse from '@deps/components/knowledge-base/chat/chat-response/chat-response';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { getFollowupMessages, sendFollowupMessage } from '@deps/queries/api/knowledge-base';
import { BOT_ERROR_MESSAGE_ID, ChatbotMessage, FeedbackType, KeyboardEvents, MessageRole, UserMessage } from '@deps/types/knowledge-base';
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
}

const FollowUp = ({ email, questionId, responseId, response, sourceDocuments = [], submittedFeedbackType = null, submittedFeedbackComment = null }: FollowUpProps) => {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'zinniaAiAssistant', });
  const { selectedClientId } = useKnowledgeBaseContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
  const [followUpChain, setFollowUpChain] = useState<any[]>([]);
  const [totalFollowUps, setTotalFollowUps] = useState<number>(0);
  const [parentFollowUpId, setParentFollowUpId] = useState<string | null>(null);

  const endref = useRef<HTMLDivElement | null>(null);

  const handleFollowUpQuestionSend = async () => {
    try {
      setChatLoading(true);
      setFollowUpQuestion('');
      if (!followUpQuestion.trim()) return;
      const userMessage = {
        id: 'new_followup_question',
        role: MessageRole.User,
        content: followUpQuestion
      }
      setFollowUpChain((prev) => [...prev, {
        id: 'new_followup_question',
        user: userMessage
      }]);
      const response = await sendFollowupMessage(questionId, followUpQuestion, selectedClientId, parentFollowUpId);
      if (response) {
        const chatbotMessage = {
          id: response?.followUpId,
          role: MessageRole.Bot,
          content: response.followUpAnswer,
          sourceDocuments: response.sourceDocuments
        };
        setFollowUpChain((prev: any) => {
          const prevMessages = [...prev];
          prevMessages[prevMessages.length - 1] = {
            ...prevMessages[prevMessages.length - 1],
            id: response.followUpId,
            chatbot: chatbotMessage
          };
          return [...prevMessages];
        });
        setTotalFollowUps((prev) => prev + 1);
        setParentFollowUpId(response?.followUpId || null)
      } else {
        browserLogError('Error getting response from chatbot', {
          questionId
        });
        const chatbotMessage = {
          id: BOT_ERROR_MESSAGE_ID,
          role: MessageRole.Bot,
          content: t('chat.errorMsg'),
        };
        setFollowUpChain((prev: any) => {
          const prevMessages = [...prev];
          prevMessages[prevMessages.length - 1] = {
            ...prevMessages[prevMessages.length - 1],
            id: BOT_ERROR_MESSAGE_ID,
            chatbot: chatbotMessage
          };
          return [...prevMessages];
        });
      }
    } catch (error) {
      browserLogError('Failed to send follow up question');
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    const fetchFollowUp = async () => {
      setLoading(true);
      try {
        const response = await getFollowupMessages(questionId);
        if (response) {
          setTotalFollowUps(response?.totalFollowUps || 0);
          const followUpMessages: {
            id: string
            user: UserMessage,
            chatbot?: ChatbotMessage
          }[] = [];
          response.followUpChain?.forEach((message: any) => {
            const { followUpId, followUpQuestion, followUpAnswer, sourceDocuments } = message;
            const userMessage: UserMessage = {
              id: followUpId,
              role: MessageRole.User,
              content: followUpQuestion,
            };
            const chatbotMessage: ChatbotMessage = {
              id: followUpId,
              questionId,
              role: MessageRole.Bot,
              content: followUpAnswer,
              sourceDocuments: sourceDocuments,
              feedbackType: null,
              feedbackComment: null
            }
            followUpMessages.push({
              id: followUpId,
              user: userMessage,
              chatbot: chatbotMessage
            });
          });
          setFollowUpChain(followUpMessages);
          setParentFollowUpId(response.followUpChain?.[response.followUpChain.length - 1].followUpId || null);
        }
      } catch (error) {
        browserLogError('Error fetching followup messages');
      } finally {
        setLoading(false);
      }

    }
    fetchFollowUp();
  }, [questionId])

  useEffect(() => {
    endref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [followUpChain]);

  return (
    <div className='w-full pt-4 flex flex-col gap-4 h-full' data-testid="followup-modal">
      {
        loading ? (
          <div className='h-[720px] w-full flex justify-center items-center'><Loader /></div>
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
              {
                followUpChain && (
                  <div>
                    {
                      followUpChain?.map((message: any) => {
                        const { id, user, chatbot } = message;
                        return (
                          <div key={id} className='mt-6 flex flex-col gap-4'>
                            <ChatQuestion question={user?.content} />
                            {
                              chatbot && <ChatResponse
                                email={email}
                                questionId={questionId}
                                responseId={chatbot.id}
                                response={chatbot.content}
                                sourceDocuments={chatbot.sourceDocuments}
                                submittedFeedbackType={null}
                                submittedFeedbackComment={null}
                                showFeedbackControls={false}
                              />
                            }
                          </div>
                        )
                      })
                    }
                    <div ref={endref} />
                  </div>
                )
              }
            </div >

            {
              chatLoading && <div className='flex items-center justify-center py-4'><Loader /></div>
            }

            <div className={`${styles.textboxContainer}`}>
              <textarea
                className={`!outline-none !ring-0 ${styles.textarea}`}
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === KeyboardEvents.Enter) {
                    handleFollowUpQuestionSend();
                  }
                }}
                disabled={chatLoading || totalFollowUps >= 5}
                placeholder={t('chat.followUpPlaceholder') || ''}
              ></textarea>

              <button
                disabled={chatLoading || totalFollowUps >= 5}
                aria-label='send-followup'
                type="button"
                onClick={handleFollowUpQuestionSend}>
                {t('chat.send')}
              </button>
            </div>
          </>
        )
      }
    </div >
  )
}

export default FollowUp


