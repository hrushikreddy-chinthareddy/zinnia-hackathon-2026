import { SourceDocument } from '@xd/api-types/dist/generated-types/knowledgebase';
import {
    Icon,
    IconType,
    Loader,
    LoaderVariant,
} from '@zinnia/bloom/components';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import { Modal } from '@deps/components/modal/modal';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { useChatStream } from '@deps/hooks/knowledge-base/useChatStream';
import { sendResponseFeedback } from '@deps/queries/api/knowledge-base';
import { ReactComponent as Dislike } from '@deps/styles/elements/icons/icons_outlined/thumb-down.svg';
import { ReactComponent as Like } from '@deps/styles/elements/icons/icons_outlined/thumb-up.svg';
import {
    DislikeReasonsPayload,
    FeedbackType,
} from '@deps/types/knowledge-base';
import { browserLogError, browserLogTrace } from '@deps/utils/browser-logging';

import styles from './chat-response.module.css';
import DislikeReasons from './dislike-reasons/dislike-reasons';
import FollowUp from '../follow-up/follow-up';

type ChatResponseProps = {
    email: string;
    questionId: string;
    responseId: string;
    response: string;
    sourceDocuments?: SourceDocument[];
    submittedFeedbackType?: FeedbackType | null;
    submittedFeedbackComment?: string | null;
    showFeedbackControls?: boolean;
    isCompleted?: boolean;
};

const ChatResponse = ({
    email,
    questionId,
    responseId,
    response,
    sourceDocuments = [],
    submittedFeedbackType = null,
    submittedFeedbackComment = null,
    showFeedbackControls = true,
    isCompleted = false,
}: ChatResponseProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const { selectedClientId } = useKnowledgeBaseContext();
    const { isStreaming } = useChatStream(selectedClientId);
    const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackTypeSubmitted, setFeedbackTypeSubmitted] = useState(false);
    const [feedbackMessageSubmitted, setFeedbackMessageSubmitted] =
        useState(false);
    const [showFeedbackTextbox, setShowFeedbackTextbox] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [dislikeReason, setDislikeReason] =
        useState<DislikeReasonsPayload | null>(null);
    const endref = useRef<HTMLDivElement | null>(null);
    const html = DOMPurify.sanitize(marked.parse(response || '') as string);

    const markdownRef = useRef<HTMLDivElement | null>(null);
    const likeTimerRef = useRef<NodeJS.Timeout | null>(null);

    const validateFeedbackPayload = () => {
        if (feedbackComment.trim().length < 1) return false;

        if (feedbackType === FeedbackType.Dislike) {
            if (!dislikeReason?.reason) return false;

            if (
                dislikeReason?.reason ===
                    t('chat.feedback.dislikeReasons.infoMissing') &&
                (!dislikeReason?.metadata ||
                    Object.keys(dislikeReason.metadata).length === 0)
            ) {
                return false;
            }
        }

        return true;
    };

    const handleDislikeReasonChange = (payload: DislikeReasonsPayload) => {
        setDislikeReason(payload);
    };

    const cancelLikeTimer = () => {
        if (likeTimerRef.current) {
            clearTimeout(likeTimerRef.current);
            likeTimerRef.current = null;
            browserLogTrace('Cancelled Like feedback api call');
        }
    };

    const handleFeedbackClick = async (type: FeedbackType) => {
        if (feedbackMessageSubmitted || feedbackTypeSubmitted) return;

        if (
            feedbackType === type &&
            !submittedFeedbackType &&
            !feedbackTypeSubmitted
        ) {
            //deselection
            setFeedbackType(null);
            setShowFeedbackTextbox(false);

            //cancelling like timer if it exists
            if (type === FeedbackType.Like) {
                cancelLikeTimer();
            }
            return;
        }

        setFeedbackType(type);
        setFeedbackComment('');
        if (type === FeedbackType.Like) {
            if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
            //waiting for 30sec before making an api call
            likeTimerRef.current = setTimeout(async () => {
                try {
                    const feedbackResponse = await sendResponseFeedback(
                        responseId,
                        email,
                        type
                    );
                    if (feedbackResponse) {
                        setFeedbackTypeSubmitted(true);
                        browserLogTrace('Feedback sent successfully');
                        return;
                    }
                } catch (error) {
                    browserLogError('Error sending feedback ::', { error });
                    return;
                } finally {
                    likeTimerRef.current = null;
                }
            }, 30000);
        } else {
            setShowFeedbackTextbox(true);
            cancelLikeTimer();
        }
    };

    const handleSendFeedbackMessage = async () => {
        const isFeedbackValidated = validateFeedbackPayload();
        if (!isFeedbackValidated) return;
        if (
            feedbackType === FeedbackType.Like ||
            (feedbackType === FeedbackType.Dislike &&
                feedbackComment.trim().length > 0)
        ) {
            if (feedbackType === FeedbackType.Like) {
                cancelLikeTimer();
            }

            try {
                const feedbackResponse = await sendResponseFeedback(
                    responseId,
                    email,
                    feedbackType,
                    feedbackComment,
                    dislikeReason
                );
                if (feedbackResponse) {
                    setFeedbackTypeSubmitted(true);
                    setFeedbackMessageSubmitted(true);
                    browserLogTrace('Feedback message sent successfully');
                }
            } catch (error) {
                browserLogError('Error sending feedback message::', { error });
                return;
            }
        }
    };

    const renderFeedbackComment = (feedbackComment: string) => {
        return (
            <div className={`${styles.submitFeedback}`}>
                <Typography variant={TypographyVariant.BodyParagraph}>
                    {t('chat.feedback.thanksMsg')}: {feedbackComment}
                </Typography>
            </div>
        );
    };

    useEffect(() => {
        endref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [feedbackType]);

    useEffect(() => {
        if (markdownRef.current) {
            const links = markdownRef.current.querySelectorAll('a');
            links.forEach((link) => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
        }
    }, [response]);

    if (!response?.trim()) {
        return (
            <div>
                <Loader variant={LoaderVariant.CTA} />
            </div>
        );
    }

    return (
        <div className="flex gap-2 items-start">
            <div className={`${styles.avatar}`} data-testid="response-avatar">
                <Icon type={IconType.ANNOTATION} />
            </div>
            <div className="flex-1 flex flex-col gap-4">
                <div className={`${styles.messageContainer}`}>
                    <div className={`${styles.responseContainer}`}>
                        <div
                            ref={markdownRef}
                            data-testid="chat-response"
                            className={`${styles.markdownWrapper} leading-snug ${styles.sourceLink}`}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                        {sourceDocuments?.length > 0 && (
                            <div className="flex flex-col items-start gap-2 my-4">
                                {sourceDocuments.map((doc) => {
                                    return (
                                        <button
                                            key={doc.drive_item_id}
                                            className={`${styles.docLink}`}
                                        >
                                            <a
                                                href={doc.web_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Icon
                                                    type={IconType.DOWNLOAD}
                                                    className="mr-2"
                                                />
                                                {doc.file_name}
                                            </a>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {showFeedbackControls && isCompleted && (
                        <div className={`${styles.feedbackControls}`}>
                            <div className="flex gap-4">
                                <div className="text-gray-500 text-md flex gap-2">
                                    <button
                                        aria-label="upvote-button"
                                        type="button"
                                        disabled={
                                            Boolean(
                                                submittedFeedbackComment ||
                                                    submittedFeedbackType
                                            ) ||
                                            feedbackMessageSubmitted ||
                                            isStreaming
                                        }
                                        onClick={() =>
                                            handleFeedbackClick(
                                                FeedbackType.Like
                                            )
                                        }
                                        className={
                                            (feedbackType ||
                                                submittedFeedbackType) ===
                                            FeedbackType.Like
                                                ? styles.activeFeedbackButton
                                                : ''
                                        }
                                    >
                                        <Like width={24} />
                                    </button>
                                    <button
                                        aria-label="downvote-button"
                                        type="button"
                                        disabled={
                                            Boolean(
                                                submittedFeedbackComment ||
                                                    submittedFeedbackType
                                            ) ||
                                            feedbackMessageSubmitted ||
                                            isStreaming
                                        }
                                        onClick={() =>
                                            handleFeedbackClick(
                                                FeedbackType.Dislike
                                            )
                                        }
                                        className={
                                            (feedbackType ||
                                                submittedFeedbackType) ===
                                            FeedbackType.Dislike
                                                ? styles.activeFeedbackButton
                                                : ''
                                        }
                                    >
                                        <Dislike width={24} />
                                    </button>
                                </div>
                                {questionId && (
                                    <div>
                                        <button
                                            aria-label="followup-button"
                                            type="button"
                                            onClick={() => {
                                                setShowFollowUp(true);
                                            }}
                                        >
                                            <Typography
                                                variant={
                                                    TypographyVariant.BodySmBold
                                                }
                                                className="cursor-pointer text-[--color-base-text-text-link]"
                                            >
                                                {t('chat.followUpButton')}
                                            </Typography>
                                        </button>
                                        <Modal
                                            open={showFollowUp}
                                            onCancel={() =>
                                                setShowFollowUp(false)
                                            }
                                            closeIcon="X"
                                            bigSize
                                            content={
                                                <FollowUp
                                                    email={email}
                                                    questionId={questionId}
                                                    responseId={responseId}
                                                    response={response}
                                                    sourceDocuments={
                                                        sourceDocuments || []
                                                    }
                                                />
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {showFeedbackControls && (
                    <>
                        {submittedFeedbackComment
                            ? renderFeedbackComment(submittedFeedbackComment)
                            : feedbackType &&
                              (feedbackMessageSubmitted ||
                              feedbackTypeSubmitted ? (
                                  feedbackMessageSubmitted &&
                                  renderFeedbackComment(feedbackComment)
                              ) : (
                                  <div
                                      className={`${styles.submitFeedback} flex flex-col gap-4`}
                                  >
                                      <Typography
                                          variant={TypographyVariant.BodySmBold}
                                      >
                                          {feedbackType ===
                                          FeedbackType.Like ? (
                                              t(
                                                  'chat.feedback.positiveFeedbackComment'
                                              )
                                          ) : (
                                              <>
                                                  {t(
                                                      'chat.feedback.negativeFeedbackComment'
                                                  )}
                                                  <span className="text-red-700">
                                                      *
                                                  </span>
                                              </>
                                          )}
                                      </Typography>
                                      {showFeedbackTextbox ? (
                                          <div>
                                              <textarea
                                                  className={`${styles.textarea} !outline-none !ring-0 text-gray-900`}
                                                  value={feedbackComment}
                                                  onChange={(e) => {
                                                      setFeedbackComment(
                                                          e.target.value
                                                      );
                                                  }}
                                                  placeholder={
                                                      t(
                                                          'chat.feedback.placeholder'
                                                      ) || ''
                                                  }
                                              ></textarea>

                                              {feedbackType ===
                                                  FeedbackType.Dislike && (
                                                  <DislikeReasons
                                                      dislikeReason={
                                                          dislikeReason ||
                                                          ({} as DislikeReasonsPayload)
                                                      }
                                                      onDislikeReasonChange={
                                                          handleDislikeReasonChange
                                                      }
                                                  />
                                              )}
                                              <div className="flex gap-2 justify-end mt-4">
                                                  <Button
                                                      aria-label="cancel-feedback-msg"
                                                      size={ButtonSize.Small}
                                                      onClick={() => {
                                                          setFeedbackComment(
                                                              ''
                                                          );
                                                          setShowFeedbackTextbox(
                                                              false
                                                          );
                                                          setDislikeReason(
                                                              null
                                                          );
                                                          if (
                                                              feedbackType ===
                                                              FeedbackType.Dislike
                                                          ) {
                                                              setFeedbackType(
                                                                  null
                                                              );
                                                          }
                                                      }}
                                                  >
                                                      {t(
                                                          'chat.feedback.cancel'
                                                      )}
                                                  </Button>
                                                  <Button
                                                      aria-label="submit-feedback-msg"
                                                      size={ButtonSize.Small}
                                                      onClick={() =>
                                                          handleSendFeedbackMessage()
                                                      }
                                                      disabled={
                                                          !validateFeedbackPayload()
                                                      }
                                                  >
                                                      {t(
                                                          'chat.feedback.submit'
                                                      )}
                                                  </Button>
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="flex justify-end">
                                              <Button
                                                  aria-label="submit-feedback-button"
                                                  type={ButtonType.Primary}
                                                  size={ButtonSize.Small}
                                                  onClick={() =>
                                                      setShowFeedbackTextbox(
                                                          true
                                                      )
                                                  }
                                                  className="mt-4"
                                              >
                                                  {t(
                                                      'chat.feedback.submitFeedback'
                                                  )}
                                              </Button>
                                          </div>
                                      )}
                                  </div>
                              ))}
                    </>
                )}
                <div ref={endref} />
            </div>
        </div>
    );
};

export default ChatResponse;
