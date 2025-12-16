import { fireEvent, render, waitFor } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    getQuizQuestions,
    submitQuizAnswers,
} from '@deps/queries/api/knowledge-base';

import Quiz from './quiz';

const defaultProps = {
    userId: 'user-123',
    selectedClientId: 'client-123',
};

const mockQuestions = [
    {
        question: 'Which system is used to update the broker account number?',
        questionId: 'question-1',
        options: {
            '0': 'MCS system',
            '1': 'Life CAD application',
            '2': 'SBS system',
            '3': 'GMS system',
        },
    },
    {
        question:
            'For a stale check request, what is the first action to take?',
        questionId: 'question-2',
        options: {
            '0': 'Search with the check number in PeopleSoft',
            '1': 'Open the request in OnBase',
            '2': 'Confirm check is stopped',
            '3': 'Locate External ID via Voucher Details',
        },
    },
];

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('@deps/queries/api/knowledge-base', () => ({
    getQuizQuestions: jest.fn(),
    submitQuizAnswers: jest.fn(),
}));

const mockBrowserLogError = jest.fn();
jest.mock('@deps/utils/browser-logging', () => {
    return {
        browserLogError: (...args: any[]) => mockBrowserLogError(...args),
    };
});

describe('Quiz', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    it('renders the quiz questions and options', async () => {
        (getQuizQuestions as jest.Mock).mockResolvedValue(mockQuestions);
        const { getByText } = render(<Quiz {...defaultProps} />);
        await waitFor(() => {
            expect(getQuizQuestions).toHaveBeenCalled();
            expect(getByText(mockQuestions[0].question)).toBeInTheDocument();
        });
    });

    it('logs error when fetching questions fails', async () => {
        (getQuizQuestions as jest.Mock).mockRejectedValue(undefined);
        render(<Quiz {...defaultProps} />);
        await waitFor(() => {
            expect(getQuizQuestions).toHaveBeenCalled();
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error fetching questions::',
                { error: undefined }
            );
        });
    });

    it('enables submit button when all questions are answered', async () => {
        (getQuizQuestions as jest.Mock).mockResolvedValue(mockQuestions);
        const { getByLabelText, findByRole } = render(
            <Quiz {...defaultProps} />
        );
        await waitFor(() => {
            expect(getQuizQuestions).toHaveBeenCalled();
        });
        const ans1 = getByLabelText(mockQuestions[0].options['0']);
        const ans2 = getByLabelText(mockQuestions[1].options['0']);
        fireEvent.click(ans1);
        fireEvent.click(ans2);
        const submitButton = await findByRole('button', {
            name: /submit-quiz-button/i,
        });
        expect(submitButton).not.toBeDisabled();
    });

    it('submits answers and shows results', async () => {
        (submitQuizAnswers as jest.Mock).mockResolvedValue({
            totalQuestions: 2,
            correctAnswers: 1,
            scorePercentage: 50,
            results: [
                {
                    questionId: 'question-1',
                    selectedAnswerIndex: 0,
                    correctAnswerIndex: 0,
                    isCorrect: true,
                    documentWebUrl: 'document-url-1',
                    documentName: 'document-1',
                },
                {
                    questionId: 'question-2',
                    selectedAnswerIndex: 0,
                    correctAnswerIndex: 1,
                    isCorrect: false,
                    documentWebUrl: 'document-url-2',
                    documentName: 'document-2',
                },
            ],
        });

        const { getByLabelText, findByRole, getByText } = render(
            <Quiz {...defaultProps} />
        );
        await waitFor(() => {
            expect(getQuizQuestions).toHaveBeenCalled();
        });
        const ans1 = getByLabelText(mockQuestions[0].options['0']);
        const ans2 = getByLabelText(mockQuestions[1].options['0']);
        fireEvent.click(ans1);
        fireEvent.click(ans2);
        const submitButton = await findByRole('button', {
            name: /submit-quiz-button/i,
        });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(submitQuizAnswers).toHaveBeenCalled();
            expect(
                getByText('sidenav.quiz.yourScore', { exact: false })
            ).toBeInTheDocument();
        });
    });

    it('shows retry button when user fails the quiz', async () => {
        (submitQuizAnswers as jest.Mock).mockResolvedValue({
            totalQuestions: 2,
            correctAnswers: 1,
            scorePercentage: 50,
            results: [
                {
                    questionId: 'question-1',
                    selectedAnswerIndex: 0,
                    correctAnswerIndex: 0,
                    isCorrect: true,
                    documentWebUrl: 'document-url-1',
                    documentName: 'document-1',
                },
                {
                    questionId: 'question-2',
                    selectedAnswerIndex: 0,
                    correctAnswerIndex: 1,
                    isCorrect: false,
                    documentWebUrl: 'document-url-2',
                    documentName: 'document-2',
                },
            ],
        });

        const { getByLabelText, findByRole } = render(
            <Quiz {...defaultProps} />
        );
        await waitFor(() => {
            expect(getQuizQuestions).toHaveBeenCalled();
        });
        const ans1 = getByLabelText(mockQuestions[0].options['0']);
        const ans2 = getByLabelText(mockQuestions[1].options['0']);
        fireEvent.click(ans1);
        fireEvent.click(ans2);
        const submitButton = await findByRole('button', {
            name: /submit-quiz-button/i,
        });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(submitQuizAnswers).toHaveBeenCalled();
        });

        const retryButton = await findByRole('button', {
            name: /retry-quiz-button/i,
        });
        fireEvent.click(retryButton);
        await waitFor(() => {
            expect(getQuizQuestions).toHaveBeenCalled();
        });
    });
});
