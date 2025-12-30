import { render, fireEvent } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserResult } from '@deps/types/knowledge-base';

import QuizQuestion from './quiz-question';

jest.mock('../quiz-answer-feedback/quiz-answer-feedback', () =>
    jest.fn(() => <div data-testid="feedback" />)
);

const mockHandleSetAnswers = jest.fn();

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

const baseProps = {
    question: 'Which system is used to update the broker account number?',
    questionId: 'question-1',
    options: {
        '0': 'MCS system',
        '1': 'Life CAD application',
        '2': 'SBS system',
        '3': 'GMS system',
    },
    userAnswers: [],
    userResult: null,
    handleSetAnswers: mockHandleSetAnswers,
};

describe('QuizQuestion', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders question and options', () => {
        const { getByText, getByLabelText } = render(
            <QuizQuestion {...baseProps} />
        );

        expect(getByText(baseProps.question)).toBeInTheDocument();

        expect(getByLabelText(baseProps.options['0'])).toBeInTheDocument();
    });

    it('calls handleSetAnswers when selecting an option', () => {
        const { getByLabelText } = render(<QuizQuestion {...baseProps} />);
        const option = getByLabelText(baseProps.options['0']);

        fireEvent.click(option);

        expect(mockHandleSetAnswers).toHaveBeenCalledWith('question-1', '0');
    });

    it('disables radio inputs after the quiz is submitted', () => {
        const props = {
            ...baseProps,
            userResult: {
                scorePercentage: 100,
                totalQuestions: 1,
                correctAnswers: 1,
                results: [
                    {
                        questionId: 'question-1',
                        selectedAnswerIndex: 0,
                        correctAnswerIndex: 0,
                        isCorrect: true,
                        documentName: 'Help Doc',
                        documentWebUrl: 'http://example.com/doc',
                    },
                ],
            } as UserResult,
        };

        const { getByLabelText } = render(<QuizQuestion {...props} />);

        expect(getByLabelText(baseProps.options['0'])).toBeDisabled();
    });
});
