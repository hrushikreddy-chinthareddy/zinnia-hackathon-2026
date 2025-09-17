import { fireEvent, render, waitFor } from '@testing-library/react';
import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';

import {
    createNewChatSession,
    getChatbotResponse,
} from '@deps/queries/api/knowledge-base';
import { BOT_ERROR_MESSAGE_ID, MessageRole } from '@deps/types/knowledge-base';

import ChatInput from './chat-input';

const mockSetSessionId = jest.fn();
const mockSetCurrentMessages = jest.fn();
const mockBrowserLogError = jest.fn();
const mockBrowserLogTrace = jest.fn();
const mockUseKnowledgeBaseContext = jest.fn();
const mockSetChatHistoryReloadTrigger = jest.fn();

jest.mock('@deps/utils/browser-logging', () => {
    return {
        browserLogError: (...args: any[]) => mockBrowserLogError(...args),
        browserLogTrace: (...args: any[]) => mockBrowserLogTrace(...args),
    };
});

jest.mock('@deps/queries/api/knowledge-base', () => ({
    createNewChatSession: jest.fn(),
    getChatbotResponse: jest.fn(),
}));

jest.mock('@deps/contexts/KnowledgeBaseContext', () => ({
    useKnowledgeBaseContext: () => mockUseKnowledgeBaseContext(),
}));

const mockOpsUserData: MeResponse = {
    id: '1234567890',
    name: 'Test',
    email: 'test@zinnia.com',
    role: MeResponse.role.ASSOCIATE,
    client: [
        {
            id: 'client-123',
            name: 'Security Benefit',
            default: true,
        },
    ],
};

describe('ChatInput', () => {
    const mockMessage = 'Hello, chatbot!';

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        (createNewChatSession as jest.Mock).mockResolvedValue({
            sessionId: '1234567890',
        });
        (getChatbotResponse as jest.Mock).mockResolvedValue({
            responseId: 'response-123',
            response: 'chat response',
            sourceDocuments: [],
            feedbackType: '',
            feedbackComment: '',
        });
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: '',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: mockSetChatHistoryReloadTrigger,
            setSelectedClient: jest.fn(),
            startNewChatSession: jest.fn(),
            viewChatHistory: jest.fn(),
        });
    });

    it('renders the chat input field and button', async () => {
        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        expect(getByRole('textbox')).toBeInTheDocument();
        expect(getByRole('button')).toBeInTheDocument();
    });

    it('calls createNewChatSession when there is no session ID', async () => {
        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const inputField = getByRole('textbox');
        const sendButton = getByRole('button');

        fireEvent.change(inputField, { target: { value: mockMessage } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(createNewChatSession).toHaveBeenCalledWith(
                mockOpsUserData.email,
                'client-123',
                mockMessage
            );
            expect(mockSetSessionId).toHaveBeenCalledWith('1234567890');
        });
    });

    it('logs error when fails to create a new session ID', async () => {
        (createNewChatSession as jest.Mock).mockResolvedValue(undefined);
        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const input = getByRole('textbox');
        const button = getByRole('button');

        fireEvent.change(input, { target: { value: mockMessage } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(createNewChatSession).toHaveBeenCalled();
            expect(mockBrowserLogError).toHaveBeenCalled();
        });
    });

    it('calls getChatbotResponse when there is a sessionId', async () => {
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: 'existing-session',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: jest.fn(),
            setSelectedClient: jest.fn(),
            startNewChatSession: jest.fn(),
            viewChatHistory: jest.fn(),
        });

        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const inputField = getByRole('textbox');
        const sendButton = getByRole('button');

        fireEvent.change(inputField, { target: { value: mockMessage } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(getChatbotResponse).toHaveBeenCalledWith(
                'existing-session',
                mockMessage,
                'client-123',
                expect.any(AbortSignal)
            );
            expect(createNewChatSession).not.toHaveBeenCalled();
            const botMessage = {
                id: 'response-123',
                role: MessageRole.Bot,
                content: 'chat response',
                sourceDocuments: [],
                feedbackType: '',
                feedbackComment: '',
            };

            const setCurrentCalls = mockSetCurrentMessages.mock.calls;

            const lastCallArg = setCurrentCalls[setCurrentCalls.length - 1][0];
            const updatedMessages = lastCallArg([
                {
                    id: 'new_user',
                    role: MessageRole.User,
                    content: mockMessage,
                },
            ]);

            expect(updatedMessages).toContainEqual(botMessage);
        });
    });

    it('logs error and shows fallback bot message when getChatbotResponse fails', async () => {
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: '1234567890',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: jest.fn(),
            setSelectedClient: jest.fn(),
            startNewChatSession: jest.fn(),
            viewChatHistory: jest.fn(),
        });
        (getChatbotResponse as jest.Mock).mockResolvedValue(undefined);
        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const input = getByRole('textbox');
        const sendButton = getByRole('button', { name: /send-button/i });

        fireEvent.change(input, { target: { value: mockMessage } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(getChatbotResponse).toHaveBeenCalled();
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error getting response from chatbot',
                {
                    sessionId: '1234567890',
                }
            );
            expect(mockSetCurrentMessages).toHaveBeenCalledWith(
                expect.any(Function)
            );

            const updateFn = mockSetCurrentMessages.mock.calls[1][0];
            const updatedMessages = updateFn([
                {
                    id: 'new_user',
                    role: MessageRole.User,
                    content: mockMessage,
                },
            ]);

            expect(updatedMessages).toEqual([
                {
                    id: 'new_user',
                    role: MessageRole.User,
                    content: mockMessage,
                },
                {
                    id: BOT_ERROR_MESSAGE_ID,
                    role: MessageRole.Bot,
                    content: 'chat.errorMsg',
                },
            ]);
        });
    });

    it('logs error when fails to send a message', async () => {
        const testError = new Error('Network failure');
        (createNewChatSession as jest.Mock).mockRejectedValue(testError);

        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const input = getByRole('textbox');
        const button = getByRole('button');

        fireEvent.change(input, { target: { value: mockMessage } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error sending message::',
                {
                    error: testError,
                }
            );
        });
    });

    it('sends message when Enter key is pressed', async () => {
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: 'existing-session',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            currentMessages: [],
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: jest.fn(),
            setSelectedClient: jest.fn(),
            startNewChatSession: jest.fn(),
            viewChatHistory: jest.fn(),
        });

        (getChatbotResponse as jest.Mock).mockResolvedValue({
            responseId: 'response-123',
            response: 'chat response',
            sourceDocuments: [],
            feedbackType: '',
            feedbackComment: '',
        });

        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const input = getByRole('textbox');

        fireEvent.change(input, { target: { value: mockMessage } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        await waitFor(() => {
            expect(getChatbotResponse).toHaveBeenCalledWith(
                'existing-session',
                mockMessage,
                'client-123',
                expect.any(AbortSignal)
            );

            expect(input).toHaveValue('');
        });
    });

    it('stops the api call when stop button is pressed and retries the api call with same question when retry button is pressed', async () => {
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: 'existing-session',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: jest.fn(),
            setSelectedClient: jest.fn(),
            startNewChatSession: jest.fn(),
            viewChatHistory: jest.fn(),
        });
        (getChatbotResponse as jest.Mock).mockImplementation(
            async (_sessionId, _message, _clientId, signal: AbortSignal) => {
                return new Promise((_, reject) => {
                    signal.addEventListener('abort', () => {
                        const abortError = new DOMException(
                            'Aborted',
                            'AbortError'
                        );
                        reject(abortError);
                    });
                });
            }
        );

        const { getByRole } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const inputField = getByRole('textbox');
        const sendButton = getByRole('button');

        fireEvent.change(inputField, { target: { value: mockMessage } });
        fireEvent.click(sendButton);

        expect(getChatbotResponse).toHaveBeenCalledWith(
            'existing-session',
            mockMessage,
            'client-123',
            expect.any(AbortSignal)
        );
        const stopButton = getByRole('button', { name: /stop-button/i });
        fireEvent.click(stopButton);

        await waitFor(() => {
            expect(mockBrowserLogTrace).toHaveBeenCalledWith(
                'Chatbot response request cancelled'
            );
        });
    });

    it('retries the API call with the same question when retry button is pressed', async () => {
        (getChatbotResponse as jest.Mock)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({
                responseId: 'response-123',
                response: 'chat response after retry',
                sourceDocuments: [],
                feedbackType: '',
                feedbackComment: '',
            });

        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: '1234567890',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            currentMessages: [],
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: jest.fn(),
            setSelectedClient: jest.fn(),
            startNewChatSession: jest.fn(),
            viewChatHistory: jest.fn(),
        });

        const { getByRole, rerender } = render(
            <ChatInput opsUserData={mockOpsUserData} />
        );
        const input = getByRole('textbox');
        const sendButton = getByRole('button', { name: /send/i });

        fireEvent.change(input, { target: { value: mockMessage } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(getChatbotResponse).toHaveBeenCalledTimes(1);
        });

        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: '1234567890',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            currentMessages: [
                {
                    id: 'new_user',
                    role: MessageRole.User,
                    content: mockMessage,
                },
                {
                    id: BOT_ERROR_MESSAGE_ID,
                    role: MessageRole.Bot,
                    content: 'chat.errorMsg',
                },
            ],
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: jest.fn(),
            setSelectedClient: jest.fn(),
            startNewChatSession: jest.fn(),
            viewChatHistory: jest.fn(),
        });

        rerender(<ChatInput opsUserData={mockOpsUserData} />);

        const retryButton = getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(mockSetCurrentMessages).toHaveBeenCalledWith(
                expect.any(Function)
            );

            expect(getChatbotResponse).toHaveBeenCalledWith(
                '1234567890',
                mockMessage,
                'client-123',
                expect.any(AbortSignal)
            );
            expect(getChatbotResponse).toHaveBeenCalledTimes(2);
        });
    });
});
