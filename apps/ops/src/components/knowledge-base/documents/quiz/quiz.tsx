import { Button, Loader } from '@zinnia/bloom/components';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    getQuizQuestions,
    submitQuizAnswers,
} from '@deps/queries/api/knowledge-base';
import { UserAnswer, UserResult } from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';
import { QuestionDto } from '@zinnia/api-types/types/knowledgebase';

import QuizQuestion from './quiz-question/quiz-question';

type QuizProps = {
    userId: string;
    selectedClientId: string;
};

const Quiz = ({ userId, selectedClientId }: QuizProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const [loading, setLoading] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuestionDto[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [userResult, setUserResult] = useState<UserResult | null>(null);

    const PASS_SCORE_PERCENTAGE = 80;
    const isUserPassed =
        userResult && userResult?.scorePercentage >= PASS_SCORE_PERCENTAGE;

    const fetchQuizQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getQuizQuestions(selectedClientId);
            if (response.length > 0) {
                setQuizQuestions(response || []);
            }
        } catch (error) {
            browserLogError('Error fetching questions::', { error });
        } finally {
            setLoading(false);
        }
    }, [selectedClientId]);

    const handleSetAnswers = (
        questionId: string,
        selectedAnswerIndex: string
    ) => {
        setUserAnswers((prev) => {
            const existing = prev.find((ans) => ans.questionId === questionId);
            const updated = {
                questionId,
                selectedAnswerIndex: Number(selectedAnswerIndex),
            };

            if (existing) {
                return prev.map((ans) =>
                    ans.questionId === questionId ? updated : ans
                );
            }
            return [...prev, updated];
        });
    };

    const checkAnswers = async () => {
        if (userAnswers.length !== quizQuestions.length) return;

        try {
            const response = await submitQuizAnswers(
                selectedClientId,
                userId,
                userAnswers
            );
            if (response) {
                const newUserResult = {
                    scorePercentage: response.scorePercentage,
                    totalQuestions: response.totalQuestions,
                    correctAnswers: response.correctAnswers,
                    results: response.results,
                };
                setUserResult(newUserResult as UserResult);
                window.scrollTo(0, 0);
            }
        } catch (error) {
            browserLogError('Error submitting answers::', { error });
        }
    };

    const loadQuiz = useCallback(() => {
        setUserAnswers([]);
        setUserResult(null);
        fetchQuizQuestions();
    }, [fetchQuizQuestions]);

    useEffect(() => {
        loadQuiz();
    }, [selectedClientId, loadQuiz]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8">
                <Loader />
            </div>
        );
    }

    return (
        <>
            {userResult !== null && (
                <div
                    className={`${
                        isUserPassed ? 'bg-green-200' : 'bg-red-200'
                    } p-4 mb-4 flex flex-col items-center`}
                >
                    <Typography
                        variant={TypographyVariant.H2}
                        className={`${
                            isUserPassed ? 'text-green-900' : 'text-red-900'
                        } mb-2 text-center`}
                    >
                        {isUserPassed
                            ? t('sidenav.quiz.quizPassed')
                            : t('sidenav.quiz.quizFailed', {
                                  passPercentage: PASS_SCORE_PERCENTAGE,
                              })}
                    </Typography>
                    <Typography variant={TypographyVariant.H4}>
                        {t('sidenav.quiz.yourScore', {
                            score: userResult.correctAnswers,
                            total: userResult.totalQuestions,
                        })}
                    </Typography>

                    {!isUserPassed && (
                        <Button
                            aria-label="retry-quiz-button"
                            mode="secondary"
                            size="small"
                            className="mt-4"
                            onClick={loadQuiz}
                        >
                            {t('sidenav.quiz.tryAgain')}
                        </Button>
                    )}
                </div>
            )}

            <div className="mb-4 p-4">
                {quizQuestions.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-4">
                            {quizQuestions.map((questionItem) => {
                                const { question, options, questionId } =
                                    questionItem;

                                return (
                                    <QuizQuestion
                                        key={questionId}
                                        question={question || ''}
                                        questionId={questionId || ''}
                                        options={options || {}}
                                        userAnswers={userAnswers}
                                        userResult={userResult}
                                        handleSetAnswers={handleSetAnswers}
                                    />
                                );
                            })}
                        </div>
                        <Button
                            aria-label="submit-quiz-button"
                            mode="primary"
                            size="small"
                            onClick={checkAnswers}
                            className="mt-4"
                            disabled={
                                userAnswers.length !== quizQuestions.length ||
                                userResult !== null
                            }
                        >
                            {t('sidenav.quiz.submit')}
                        </Button>
                    </>
                ) : (
                    <div>{t('sidenav.quiz.noQuestionsAvailable')}</div>
                )}
            </div>
        </>
    );
};

export default Quiz;
