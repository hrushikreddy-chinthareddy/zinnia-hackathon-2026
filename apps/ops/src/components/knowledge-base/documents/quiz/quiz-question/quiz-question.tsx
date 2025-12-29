import Radio from '@deps/components/radio/radio';
import { UserAnswer, UserResult } from '@deps/types/knowledge-base';

import QuizAnswerFeedback from '../quiz-answer-feedback/quiz-answer-feedback';

type QuizQuestionProps = {
    questionId: string;
    question: string;
    options: Record<string, string>;
    userAnswers: UserAnswer[];
    userResult: UserResult | null;
    handleSetAnswers: (questionId: string, selectedAnswerIndex: string) => void;
};
const QuizQuestion = ({
    question,
    questionId,
    options,
    userAnswers,
    userResult,
    handleSetAnswers,
}: QuizQuestionProps) => {
    const radioOptions = Object.keys(options).map((key, index) => ({
        label: options[key],
        subElement: (
            <>
                <strong>{String.fromCharCode(65 + index)}.</strong>{' '}
                {options[key]}
            </>
        ),
        value: key,
        showLabel: false,
    }));

    const displayCorrectness = () => {
        const result = userResult?.results.find(
            (res) => res.questionId === questionId
        );
        if (result) {
            return (
                <QuizAnswerFeedback
                    isCorrect={result.isCorrect}
                    correctAnswerIndex={result.correctAnswerIndex}
                    correctAnswer={
                        options[result.correctAnswerIndex.toString()]
                    }
                    documentInfo={
                        !result.isCorrect
                            ? {
                                  documentName: result.documentName,
                                  documentWebUrl: result.documentWebUrl,
                              }
                            : null
                    }
                />
            );
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Radio
                label={question}
                items={radioOptions}
                value={
                    userAnswers
                        .find((ans) => ans.questionId === questionId)
                        ?.selectedAnswerIndex?.toString() || ''
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleSetAnswers(questionId, e.target.value)
                }
                required
                disabled={userResult !== null}
            />
            {userResult && displayCorrectness()}
        </div>
    );
};

export default QuizQuestion;
