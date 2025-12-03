import { fireEvent, render, waitFor } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { sendResponseFeedback } from '@deps/queries/api/knowledge-base';
import { FeedbackType } from '@deps/types/knowledge-base';

import ChatResponse from './chat-response';

const defaultProps = {
    email: 'test@zinnia.com',
    questionId: 'question-123',
    responseId: 'response-123',
    response: 'This is the **bold** response.',
    sourceDocuments: [
        {
            drive_item_id: 'doc-1',
            file_name: 'Sample.pdf',
            web_url: 'https://example.com/sample.pdf',
        },
    ],
    submittedFeedbackType: null,
    submittedFeedbackComment: null,
    isCompleted: true,
    isStreaming: false,
};

const mockBrowserLogError = jest.fn();
const mockBrowserLogTrace = jest.fn();

jest.mock('@deps/utils/browser-logging', () => {
    return {
        browserLogError: (...args: any[]) => mockBrowserLogError(...args),
        browserLogTrace: (...args: any[]) => mockBrowserLogTrace(...args),
    };
});

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('@deps/queries/api/knowledge-base', () => ({
    sendResponseFeedback: jest.fn(),
}));

jest.mock('marked', () => ({
    marked: {
        parse: jest.fn(
            () => `<p>This is the <strong>bold</strong> response.</p>`
        ),
    },
}));

jest.mock('dompurify', () => ({
    sanitize: jest.fn((html) => html),
}));

jest.mock('@deps/hooks/knowledge-base/useChatStream', () => ({
    useChatStream: () => ({
        isStreaming: false,
    }),
}));

const mockChangeContent = jest.fn();

jest.mock('@deps/contexts/SideSheetContext', () => ({
    useSideSheetContext: () => ({
        changeSideSheetContent: mockChangeContent,
        handleOpen: jest.fn(),
    }),
}));

describe('ChatResponse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        window.HTMLElement.prototype.scrollIntoView = jest.fn();
    });

    it('renders response with markdown formatting', async () => {
        const { getByText, getByTestId } = render(
            <ChatResponse {...defaultProps} />
        );
        await waitFor(() => {
            const container = getByTestId('chat-response');
            expect(container.innerHTML).toContain('<strong>bold</strong>');
            expect(getByText('bold').tagName).toBe('STRONG');
        });
    });

    it('renders source documents if present', () => {
        const { getByText } = render(<ChatResponse {...defaultProps} />);
        expect(getByText('Sample.pdf')).toBeInTheDocument();
    });

    it('sends like feedback on clicking upvote', async () => {
        jest.useFakeTimers();
        (sendResponseFeedback as jest.Mock).mockResolvedValue(true);
        const { getByRole } = render(<ChatResponse {...defaultProps} />);
        const likeButton = getByRole('button', { name: /upvote-button/i });
        fireEvent.click(likeButton);

        jest.advanceTimersByTime(30000);

        await waitFor(() => {
            expect(sendResponseFeedback).toHaveBeenCalledWith(
                'response-123',
                'test@zinnia.com',
                FeedbackType.Like
            );
            expect(mockBrowserLogTrace).toHaveBeenCalledWith(
                'Feedback sent successfully'
            );
        });
        jest.useRealTimers();
    });

    it('cancels like api call if like is deselected before 30sec', async () => {
        (sendResponseFeedback as jest.Mock).mockResolvedValue(true);
        const { getByRole } = render(<ChatResponse {...defaultProps} />);
        const likeButton = getByRole('button', { name: /upvote-button/i });
        fireEvent.click(likeButton);

        fireEvent.click(likeButton);

        await waitFor(() => {
            expect(sendResponseFeedback).not.toHaveBeenCalled();
            expect(mockBrowserLogTrace).toHaveBeenCalledWith(
                'Cancelled Like feedback api call'
            );
        });
    });

    it('cancels like api call if dislike is selected before 30sec', async () => {
        (sendResponseFeedback as jest.Mock).mockResolvedValue(true);
        const { getByRole } = render(<ChatResponse {...defaultProps} />);
        const likeButton = getByRole('button', { name: /upvote-button/i });
        const dislikeButton = getByRole('button', { name: /downvote-button/i });
        fireEvent.click(likeButton);
        fireEvent.click(dislikeButton);

        await waitFor(() => {
            expect(sendResponseFeedback).not.toHaveBeenCalled();
            expect(mockBrowserLogTrace).toHaveBeenCalledWith(
                'Cancelled Like feedback api call'
            );
        });
    });

    it('clears the like api timer if feedback comment is submitted before 30 sec', async () => {
        (sendResponseFeedback as jest.Mock).mockResolvedValue(true);
        const { getByRole } = render(<ChatResponse {...defaultProps} />);
        const likeButton = getByRole('button', { name: /upvote-button/i });
        fireEvent.click(likeButton);

        const submitFeedbackButton = getByRole('button', {
            name: /submit-feedback-button/i,
        });
        fireEvent.click(submitFeedbackButton);

        const textbox = getByRole('textbox');
        const submitButton = getByRole('button', {
            name: /submit-feedback-msg/i,
        });
        fireEvent.change(textbox, { target: { value: 'test comment' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockBrowserLogTrace).toHaveBeenCalledWith(
                'Cancelled Like feedback api call'
            );
            expect(sendResponseFeedback).toHaveBeenCalledWith(
                'response-123',
                'test@zinnia.com',
                FeedbackType.Like,
                'test comment',
                null
            );
            expect(mockBrowserLogTrace).toHaveBeenCalledWith(
                'Feedback message sent successfully'
            );
        });
    });

    it('sends dislike feedback only on clicking downvote and submitting feedback comment along with dislike reasons', async () => {
        (sendResponseFeedback as jest.Mock).mockResolvedValue(true);
        const { getByRole, getAllByRole } = render(
            <ChatResponse {...defaultProps} />
        );
        const dislikeButton = getByRole('button', { name: /downvote-button/i });
        fireEvent.click(dislikeButton);

        const textbox = getByRole('textbox');
        fireEvent.change(textbox, { target: { value: 'test comment' } });

        const radioButtons = getAllByRole('radio');
        fireEvent.click(radioButtons[0]);

        const submitButton = getByRole('button', {
            name: /submit-feedback-msg/i,
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(sendResponseFeedback).toHaveBeenCalledWith(
                'response-123',
                'test@zinnia.com',
                FeedbackType.Dislike,
                'test comment',
                expect.any(Object)
            );
            expect(mockBrowserLogTrace).toHaveBeenCalledWith(
                'Feedback message sent successfully'
            );
        });
    });

    it('logs errors when fails to send a feedback on clicking upvote', async () => {
        jest.useFakeTimers();
        const testError = new Error('Network failure');
        (sendResponseFeedback as jest.Mock).mockRejectedValue(testError);
        const { getByRole } = render(<ChatResponse {...defaultProps} />);
        const likeButton = getByRole('button', { name: /upvote-button/i });
        fireEvent.click(likeButton);

        jest.advanceTimersByTime(30000);

        await waitFor(() => {
            expect(sendResponseFeedback).toHaveBeenCalledWith(
                'response-123',
                'test@zinnia.com',
                FeedbackType.Like
            );
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error sending feedback ::',
                { error: testError }
            );
        });
        jest.useRealTimers();
    });

    it('logs errors when fails to send a feedback comment', async () => {
        const testError = new Error('Network failure');
        (sendResponseFeedback as jest.Mock).mockRejectedValue(testError);
        const { getByRole, getAllByRole } = render(
            <ChatResponse {...defaultProps} />
        );
        const dislikeButton = getByRole('button', { name: /downvote-button/i });
        fireEvent.click(dislikeButton);

        const textbox = getByRole('textbox');
        fireEvent.change(textbox, { target: { value: 'test comment' } });

        const radioButtons = getAllByRole('radio');
        fireEvent.click(radioButtons[0]);

        const submitButton = getByRole('button', {
            name: /submit-feedback-msg/i,
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(sendResponseFeedback).toHaveBeenCalledWith(
                'response-123',
                'test@zinnia.com',
                FeedbackType.Dislike,
                'test comment',
                expect.any(Object)
            );
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error sending feedback message::',
                { error: testError }
            );
        });
    });

    it('closes the feedback comment textbox on clicking cancel when like feedback is submitted', async () => {
        (sendResponseFeedback as jest.Mock).mockResolvedValue(true);
        const { getByRole } = render(<ChatResponse {...defaultProps} />);
        const likeButton = getByRole('button', { name: /upvote-button/i });
        fireEvent.click(likeButton);

        const submitFeedbackButton = getByRole('button', {
            name: /submit-feedback-button/i,
        });
        fireEvent.click(submitFeedbackButton);

        const textbox = getByRole('textbox');
        expect(textbox).toBeVisible();
        const cancelButton = getByRole('button', {
            name: /cancel-feedback-msg/i,
        });
        fireEvent.click(cancelButton);
        expect(textbox).not.toBeVisible();
    });

    it('opens the followup sidesheet when clicking on ask follow up questions button', async () => {
        const { getByRole } = render(<ChatResponse {...defaultProps} />);
        const followUpButton = getByRole('button', {
            name: /followup-button/i,
        });
        fireEvent.click(followUpButton);

        expect(mockChangeContent).toHaveBeenCalled();
        const element = mockChangeContent.mock.calls[0][1];
        const { getByTestId } = render(element);
        expect(getByTestId('followup-modal')).toBeVisible();
    });
});
