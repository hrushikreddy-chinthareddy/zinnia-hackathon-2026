import { Icon, IconType } from '@zinnia/bloom/components';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import FieldLabel from '@deps/components/fields/field-label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import useNavLink from '@deps/hooks/useNavLink';
import { sendResponseFeedback } from '@deps/queries/api/knowledge-base';
import { ReactComponent as Dislike } from '@deps/styles/elements/icons/icons_outlined/thumb-down.svg';
import { ReactComponent as Like } from '@deps/styles/elements/icons/icons_outlined/thumb-up.svg';
import {
    AnswerMode,
    DislikeReasonsPayload,
    FeedbackType,
} from '@deps/types/knowledge-base';
import { browserLogError, browserLogTrace } from '@deps/utils/browser-logging';
import { SourceDocument } from '@zinnia/api-types/types/knowledgebase';

import styles from './chat-response.module.css';
import DislikeReasons from './dislike-reasons/dislike-reasons';
import AiLogo from '../ai-logo/ai-logo';
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
    definitiveAnswerFound?: boolean | null;
    isFollowUp?: boolean;
    searchCommonClientFollowUp?: () => void;
    isStreaming: boolean;
    getCommonClientResponse?: (
        sessionId: string,
        questionId: string,
        messageId: string,
        responseType: AnswerMode
    ) => void;
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
    definitiveAnswerFound = null,
    isFollowUp = false,
    searchCommonClientFollowUp = () => {},
    isStreaming,
    getCommonClientResponse = () => {},
}: ChatResponseProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const { buildOpenInNewWindowLinkText } = useNavLink();
    const { sessionId, selectedClientId, commonClientId, answerMode } =
        useKnowledgeBaseContext();
    const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackTypeSubmitted, setFeedbackTypeSubmitted] = useState(false);
    const [feedbackMessageSubmitted, setFeedbackMessageSubmitted] =
        useState(false);
    const [showFeedbackTextbox, setShowFeedbackTextbox] = useState(false);
    const [dislikeReason, setDislikeReason] =
        useState<DislikeReasonsPayload | null>(null);
    const [
        showDefinitiveAnswerNotFoundControls,
        setShowDefinitiveAnswerNotFoundControls,
    ] = useState(definitiveAnswerFound === false);
    const [feedbackSubmitLoading, setFeedbackSubmitLoading] = useState(false);
    const endref = useRef<HTMLDivElement | null>(null);
    const html = DOMPurify.sanitize(marked.parse(response || '') as string);

    const markdownRef = useRef<HTMLDivElement | null>(null);
    const likeTimerRef = useRef<NodeJS.Timeout | null>(null);

    const sidesheet = useSideSheetContextLegacy();

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
        setFeedbackSubmitLoading(true);
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
            } finally {
                setFeedbackSubmitLoading(false);
            }
        }
    };

    const renderFeedbackComment = (feedbackComment: string) => {
        return (
            <div className={`${styles.submitFeedback} mt-4`}>
                <Typography variant={TypographyVariant.BodyParagraph}>
                    {t('chat.feedback.thanksMsg')}: {feedbackComment}
                </Typography>
            </div>
        );
    };

    const searchCommonClient = async () => {
        if (isFollowUp) {
            searchCommonClientFollowUp();
        } else {
            await getCommonClientResponse(
                sessionId,
                questionId,
                responseId,
                answerMode
            );
        }
    };

    const handleCancelFeedbackMessage = () => {
        setFeedbackComment('');
        setShowFeedbackTextbox(false);
        setDislikeReason(null);
        if (feedbackType === FeedbackType.Dislike) {
            setFeedbackType(null);
        }
    };

    const renderFeedbackButton = (selectedfeedbackType: FeedbackType) => {
        return (
            <button
                aria-label={
                    selectedfeedbackType === FeedbackType.Like
                        ? 'upvote-button'
                        : 'downvote-button'
                }
                type="button"
                disabled={
                    Boolean(
                        submittedFeedbackComment || submittedFeedbackType
                    ) ||
                    feedbackMessageSubmitted ||
                    isStreaming
                }
                onClick={() => handleFeedbackClick(selectedfeedbackType)}
                className={
                    (feedbackType || submittedFeedbackType) ===
                    selectedfeedbackType
                        ? styles.activeFeedbackButton
                        : ''
                }
            >
                {selectedfeedbackType === FeedbackType.Like ? (
                    <Like width={24} />
                ) : (
                    <Dislike width={24} />
                )}
            </button>
        );
    };

    const handleOpenFollowUpSidesheet = () => {
        sidesheet.changeSideSheetContent(
            t('chat.followUpButton'),
            <FollowUp
                email={email}
                questionId={questionId}
                responseId={responseId}
                response={response}
                sourceDocuments={sourceDocuments || []}
                selectedClientId={selectedClientId}
                commonClientId={commonClientId || ''}
            />,
            true
        );
        sidesheet.handleOpen(true, 1100);
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

    useEffect(() => {
        setShowDefinitiveAnswerNotFoundControls(
            definitiveAnswerFound === false
        );
    }, [definitiveAnswerFound]);

    if (!response?.trim()) {
        return (
            <AiLogo width="30px" height="30px" autoPlay={true} loop={true} />
        );
    }

    return (
        <div className="w-full flex gap-2 items-start">
            <div className="w-full flex-1 flex flex-col">
                <div className={`${styles.messageContainer}`}>
                    <div className={`${styles.responseContainer}`}>
                        {showDefinitiveAnswerNotFoundControls ? (
                            <div>
                                <Typography
                                    variant={TypographyVariant.BodyParagraph}
                                >
                                    {t('chat.definitiveAnswerNotFound')}
                                </Typography>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        type={ButtonType.Primary}
                                        size={ButtonSize.Small}
                                        onClick={searchCommonClient}
                                    >
                                        {t('chat.yes')}
                                    </Button>
                                    <Button
                                        type={ButtonType.Secondary}
                                        size={ButtonSize.Small}
                                        onClick={() =>
                                            setShowDefinitiveAnswerNotFoundControls(
                                                false
                                            )
                                        }
                                    >
                                        {t('chat.no')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
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
                                                    <Icon
                                                        type={IconType.DOWNLOAD}
                                                        className="mr-2"
                                                    />
                                                    <a
                                                        href={doc.web_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        aria-label={buildOpenInNewWindowLinkText(
                                                            doc.file_name
                                                        )}
                                                    >
                                                        {doc.file_name}
                                                    </a>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!showDefinitiveAnswerNotFoundControls &&
                        showFeedbackControls &&
                        questionId &&
                        !isStreaming && (
                            <div className={`${styles.feedbackControls}`}>
                                <div className="flex gap-4">
                                    <div className="text-gray-500 text-md flex gap-2">
                                        {renderFeedbackButton(
                                            FeedbackType.Like
                                        )}
                                        {renderFeedbackButton(
                                            FeedbackType.Dislike
                                        )}
                                    </div>

                                    <button
                                        aria-label="followup-button"
                                        type="button"
                                        onClick={handleOpenFollowUpSidesheet}
                                    >
                                        <Typography
                                            variant={
                                                TypographyVariant.BodySmBold
                                            }
                                            className="cursor-pointer text-[--color-base-text-link]"
                                        >
                                            {t('chat.followUpButton')}
                                        </Typography>
                                    </button>
                                </div>
                            </div>
                        )}
                </div>

                {!showDefinitiveAnswerNotFoundControls &&
                    showFeedbackControls && (
                        <>
                            {submittedFeedbackComment
                                ? renderFeedbackComment(
                                      submittedFeedbackComment
                                  )
                                : feedbackType &&
                                  (feedbackMessageSubmitted ||
                                  feedbackTypeSubmitted ? (
                                      feedbackMessageSubmitted &&
                                      renderFeedbackComment(feedbackComment)
                                  ) : (
                                      <div
                                          className={`${styles.submitFeedback} mt-4 flex flex-col gap-4`}
                                      >
                                          <FieldLabel
                                              label={
                                                  feedbackType ===
                                                  FeedbackType.Like
                                                      ? t(
                                                            'chat.feedback.positiveFeedbackComment'
                                                        ) || ''
                                                      : t(
                                                            'chat.feedback.negativeFeedbackComment'
                                                        ) || ''
                                              }
                                              required={
                                                  feedbackType ===
                                                  FeedbackType.Dislike
                                              }
                                          />
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
                                                          size={
                                                              ButtonSize.Small
                                                          }
                                                          onClick={
                                                              handleCancelFeedbackMessage
                                                          }
                                                          disabled={
                                                              feedbackSubmitLoading
                                                          }
                                                      >
                                                          {t(
                                                              'chat.feedback.cancel'
                                                          )}
                                                      </Button>
                                                      <Button
                                                          aria-label="submit-feedback-msg"
                                                          size={
                                                              ButtonSize.Small
                                                          }
                                                          onClick={
                                                              handleSendFeedbackMessage
                                                          }
                                                          disabled={
                                                              !validateFeedbackPayload() ||
                                                              feedbackSubmitLoading
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
