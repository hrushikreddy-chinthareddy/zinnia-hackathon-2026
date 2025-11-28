import { render } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';

import QuizAnswerFeedback from './quiz-answer-feedback';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: DEFAULT_LOCALE },
    }),
}));

describe('QuizAnswerFeedback', () => {
    it('renders success message when answer is correct', () => {
        const { getByText, queryByText } = render(
            <QuizAnswerFeedback
                isCorrect={true}
                correctAnswerIndex={0}
                correctAnswer="MCS"
                documentInfo={null}
            />
        );
        expect(getByText('sidenav.quiz.correctAnswer')).toBeInTheDocument();
        expect(queryByText('sidenav.quiz.wrongAnswer')).not.toBeInTheDocument();
        expect(queryByText('sidenav.quiz.readMore')).not.toBeInTheDocument();
    });

    it('renders error message when answer is wrong', () => {
        const { getByText } = render(
            <QuizAnswerFeedback
                isCorrect={false}
                correctAnswerIndex={0}
                correctAnswer="MCS"
                documentInfo={null}
            />
        );

        expect(getByText('sidenav.quiz.wrongAnswer')).toBeInTheDocument();
    });

    it('renders document link when documentInfo is provided', () => {
        const docInfo = {
            documentName: 'Help Doc',
            documentWebUrl: 'http://example.com/doc',
        };

        const { getByText, getByRole } = render(
            <QuizAnswerFeedback
                isCorrect={false}
                correctAnswerIndex={0}
                correctAnswer="Paris"
                documentInfo={docInfo}
            />
        );

        expect(getByText('sidenav.quiz.readMore:')).toBeInTheDocument();
        const link = getByRole('link', { name: docInfo.documentName });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', docInfo.documentWebUrl);
    });
});
