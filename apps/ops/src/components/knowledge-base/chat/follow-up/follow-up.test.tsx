import { fireEvent, render, waitFor } from "@testing-library/react";

import { getFollowupMessages, sendFollowupMessage } from "@deps/queries/api/knowledge-base";

import FollowUp from "./follow-up";

const defaultProps = {
  email: 'test@zinnia.com',
  questionId: 'question-123',
  responseId: 'response-123',
  response: 'test response',
  sourceDocuments: [
    {
      drive_item_id: "doc-1",
      file_name: "Sample.pdf",
      web_url: "https://example.com/sample.pdf",
    },
  ],
  submittedFeedbackType: null,
  submittedFeedbackComment: null,
};

const mockBrowserLogError = jest.fn();
const mockBrowserLogTrace = jest.fn();

jest.mock('@deps/utils/browser-logging', () => {
  return {
    browserLogError: (...args: any[]) => mockBrowserLogError(...args),
    browserLogTrace: (...args: any[]) => mockBrowserLogTrace(...args),
  };
});

jest.mock('@deps/queries/api/knowledge-base', () => ({
  getFollowupMessages: jest.fn(),
  sendFollowupMessage: jest.fn()
}));

jest.mock('@deps/contexts/KnowledgeBaseContext', () => ({
  useKnowledgeBaseContext: () => ({
    selectedClientId: 'session-123'
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key === 'chat.errorMsg' ? 'An error occurred' : key
  })
}));

jest.mock("marked", () => ({
  marked: {
    parse: jest.fn(() => `<p>This is the <strong>bold</strong> response.</p>`),
  },
}));

jest.mock('@deps/components/knowledge-base/chat/chat-response/chat-response', () => {
  const MockChatResponse = ({ response }: any) => (
    <div data-testid="chat-response">{response}</div>
  );
  MockChatResponse.displayName = 'MockChatResponse';
  return MockChatResponse;
});

describe('FollowUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('it renders the response on opening follow up modal', async () => {
    const { getByTestId } = render(<FollowUp {...defaultProps} />);
    await waitFor(() => {
      expect(getByTestId('chat-response')).toHaveTextContent('test response');
    })
  });

  it('fetches all follow up messages if any', async () => {
    (getFollowupMessages as jest.Mock).mockResolvedValue({
      followUpChain: [
        {
          followUpId: "followup-1",
          originalMessageId: "message-1",
          followUpQuestion: "question 1",
          followUpAnswer: "Answer 1",
          sourceDocuments: [],
        }
      ],
      totalFollowUps: 1,
      maxFollowUpsAllowed1: 5,
      canAddMore: true
    });

    const { getAllByTestId } = render(<FollowUp {...defaultProps} />);
    expect(getFollowupMessages).toHaveBeenCalledWith(defaultProps.questionId);

    await waitFor(() => {
      const responses = getAllByTestId('chat-response');
      expect(responses.some(r => r.textContent?.includes('Answer 1'))).toBe(true);
    });
  });

  it('logs error if fails to fetch follow up messages', async () => {
    (getFollowupMessages as jest.Mock).mockRejectedValue(new Error('Network failure'));
    render(<FollowUp {...defaultProps} />);
    expect(getFollowupMessages).toHaveBeenCalledWith(defaultProps.questionId);

    await waitFor(() => {
      expect(mockBrowserLogError).toHaveBeenCalled();
    });
  })

  it('sends follow up message and gets answer', async () => {
    (sendFollowupMessage as jest.Mock).mockResolvedValue({
      followUpId: "followup-1",
      originalMessageId: "message-1",
      followUpQuestion: "question 1",
      followUpAnswer: "Answer 1",
      sourceDocuments: [],
    });
    (getFollowupMessages as jest.Mock).mockResolvedValue(true)

    const { getByRole, getAllByTestId } = render(<FollowUp {...defaultProps} />);

    await waitFor(() => {
      expect(getFollowupMessages).toHaveBeenCalled();
    })
    const textbox = getByRole('textbox');
    const sendButton = getByRole('button', { name: /send-followup/i });
    fireEvent.change(textbox, { target: { value: 'test follow up' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(sendFollowupMessage).toHaveBeenCalledWith(defaultProps.questionId, 'test follow up', 'session-123', null);
      const responses = getAllByTestId('chat-response');
      expect(responses.some(r => r.textContent?.includes('Answer 1'))).toBe(true);
    })

  });

  it('sends a message when enter key is pressed', async () => {
    (getFollowupMessages as jest.Mock).mockResolvedValue(true)

    const { getByRole, getAllByTestId } = render(<FollowUp {...defaultProps} />);

    await waitFor(() => {
      expect(getFollowupMessages).toHaveBeenCalled();
    })
    const textbox = getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'test follow up' } });
    fireEvent.keyDown(textbox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(sendFollowupMessage).toHaveBeenCalledWith(defaultProps.questionId, 'test follow up', 'session-123', null);
      const responses = getAllByTestId('chat-response');
      expect(responses.some(r => r.textContent?.includes('Answer 1'))).toBe(true);
    })
  })

  it('logs an error and adds a bot_error message if sendFollowupMessage returns falsy', async () => {
    (getFollowupMessages as jest.Mock).mockResolvedValue(true);
    (sendFollowupMessage as jest.Mock).mockResolvedValue(undefined);

    const { getByRole } = render(<FollowUp {...defaultProps} />);

    await waitFor(() => {
      expect(getFollowupMessages).toHaveBeenCalled();
    })

    const textbox = getByRole('textbox');
    const sendButton = getByRole('button', { name: /send-followup/i });

    fireEvent.change(textbox, { target: { value: 'my follow up' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockBrowserLogError).toHaveBeenCalledWith(
        'Error getting response from chatbot',
        { questionId: 'question-123' }
      );
    });
  });

  it('logs error when sendFollowUpMessage throws an error ', async () => {
    (getFollowupMessages as jest.Mock).mockResolvedValue(true);
    (sendFollowupMessage as jest.Mock).mockRejectedValue(new Error('Network failure'));
    const { getByRole } = render(<FollowUp {...defaultProps} />);

    await waitFor(() => {
      expect(getFollowupMessages).toHaveBeenCalled();
    })

    const textbox = getByRole('textbox');
    const sendButton = getByRole('button', { name: /send-followup/i });

    fireEvent.change(textbox, { target: { value: 'my follow up' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockBrowserLogError).toHaveBeenCalled();
    });
  })

})