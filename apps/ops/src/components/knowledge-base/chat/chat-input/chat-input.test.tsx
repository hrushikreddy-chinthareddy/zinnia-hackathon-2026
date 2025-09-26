import { fireEvent, render, waitFor } from '@testing-library/react';
import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';

import { useChatStream } from '@deps/hooks/knowledge-base/useChatStream';
import { createNewChatSession } from '@deps/queries/api/knowledge-base';
import { BOT_ERROR_MESSAGE_ID, MessageRole } from '@deps/types/knowledge-base';

import ChatInput from './chat-input';

const mockSetSessionId = jest.fn();
const mockSetCurrentMessages = jest.fn();
const mockBrowserLogError = jest.fn();
const mockBrowserLogTrace = jest.fn();
const mockUseKnowledgeBaseContext = jest.fn();
const mockSetChatHistoryReloadTrigger = jest.fn();
const mockSendMessage = jest.fn();
const mockStopStreaming = jest.fn();

jest.mock('@deps/utils/browser-logging', () => ({
    browserLogError: (...args: any[]) => mockBrowserLogError(...args),
    browserLogTrace: (...args: any[]) => mockBrowserLogTrace(...args),
}));

jest.mock('@deps/queries/api/knowledge-base', () => ({
    createNewChatSession: jest.fn(),
}));

jest.mock('@deps/contexts/KnowledgeBaseContext', () => ({
    useKnowledgeBaseContext: () => mockUseKnowledgeBaseContext(),
}));

jest.mock('@deps/hooks/knowledge-base/useChatStream', () => ({
    useChatStream: jest.fn(),
}));

const mockOpsUserData: MeResponse = {
    id: '1234567890',
    name: 'Test',
    email: 'test@zinnia.com',
    role: MeResponse.role.ASSOCIATE,
    client: [{ id: 'client-123', name: 'Security Benefit', default: true }],
};

describe('ChatInput', () => {
    const mockMessage = 'Hello, chatbot!';

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        (createNewChatSession as jest.Mock).mockResolvedValue({
            sessionId: '1234567890',
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
            currentMessages: [],
        });

        (useChatStream as jest.Mock).mockReturnValue({
            response: '',
            status: '',
            sources: [],
            isStreaming: false,
            questionId: null,
            responseId: null,
            sendMessage: mockSendMessage,
            stopStreaming: mockStopStreaming,
            isStreamingRef: { current: false },
        });
    });

    it('renders the chat input field and button', () => {
        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );
        expect(getByRole('textbox')).toBeInTheDocument();
        expect(getByRole('button', { name: /send-button/i })).toBeInTheDocument();
    });

    it('calls createNewChatSession when no sessionId exists', async () => {
        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );
        fireEvent.change(getByRole('textbox'), {
            target: { value: mockMessage },
        });
        fireEvent.click(getByRole('button', { name: /send-button/i }));

        await waitFor(() => {
            expect(createNewChatSession).toHaveBeenCalledWith(
                mockOpsUserData.email,
                'client-123',
                mockMessage
            );
            expect(mockSetSessionId).toHaveBeenCalledWith('1234567890');
            expect(mockSendMessage).toHaveBeenCalledWith(
                '1234567890',
                mockMessage
            );
        });
    });

    it('uses existing sessionId and calls sendMessage directly', async () => {
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: 'existing-session',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            currentMessages: [],
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: mockSetChatHistoryReloadTrigger,
        });

        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );
        fireEvent.change(getByRole('textbox'), {
            target: { value: mockMessage },
        });
        fireEvent.click(getByRole('button', { name: /send-button/i }));

        await waitFor(() => {
            expect(createNewChatSession).not.toHaveBeenCalled();
            expect(mockSendMessage).toHaveBeenCalledWith(
                'existing-session',
                mockMessage
            );
        });
    });

    it('logs error and does not send message if createNewChatSession fails to return sessionId', async () => {
        (createNewChatSession as jest.Mock).mockResolvedValue(undefined);

        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );

        const input = getByRole('textbox');
        const sendButton = getByRole('button', { name: /send-button/i });

        fireEvent.change(input, { target: { value: mockMessage } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(createNewChatSession).toHaveBeenCalledWith(
                mockOpsUserData.email,
                'client-123',
                mockMessage
            );
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Failed to create new chat session',
                {
                    email: mockOpsUserData.email,
                    clientId: 'client-123',
                }
            );
            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });

    it('calls stopStreaming when stop button is clicked', () => {
        (useChatStream as jest.Mock).mockReturnValue({
            response: '',
            status: '',
            sources: [],
            isStreaming: true,
            questionId: null,
            responseId: null,
            sendMessage: jest.fn(),
            stopStreaming: mockStopStreaming,
            isStreamingRef: { current: true },
        });

        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );
        const stopButton = getByRole('button', { name: /stop-button/i });

        fireEvent.click(stopButton);
        expect(mockStopStreaming).toHaveBeenCalledTimes(1);
    });

    it('sends message on Enter key press', async () => {
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: 'existing-session',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessages,
            currentMessages: [],
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: mockSetChatHistoryReloadTrigger,
        });

        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );
        fireEvent.change(getByRole('textbox'), {
            target: { value: mockMessage },
        });
        fireEvent.keyDown(getByRole('textbox'), {
            key: 'Enter',
            code: 'Enter',
            charCode: 13,
        });

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith(
                'existing-session',
                mockMessage
            );
        });
    });

    it('retries the last message when retry button is clicked', async () => {
        const mockErrorMsg = 'chat.errorMsg';
        const mockSetCurrentMessagesLocal = jest.fn();

        // Set initial context with a bot error message
        mockUseKnowledgeBaseContext.mockReturnValue({
            sessionId: '1234567890',
            setSessionId: mockSetSessionId,
            selectedClientId: 'client-123',
            setCurrentMessages: mockSetCurrentMessagesLocal,
            currentMessages: [
                {
                    id: 'user_msg_1',
                    role: MessageRole.User,
                    content: mockMessage,
                },
                {
                    id: BOT_ERROR_MESSAGE_ID,
                    role: MessageRole.Bot,
                    content: mockErrorMsg,
                },
            ],
            chatHistoryReloadTrigger: 0,
            setChatHistoryReloadTrigger: jest.fn(),
        });

        // Render the component
        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );

        const input = getByRole('textbox');
        const retryButton = getByRole('button', { name: /retry-button/i });

        // Simulate typing message (this sets lastMessage.current inside handleMessageSend)
        fireEvent.change(input, { target: { value: mockMessage } });
        fireEvent.click(getByRole('button', { name: /send-button/i }));

        // Now click retry
        fireEvent.click(retryButton);

        await waitFor(() => {
            // lastMessage.current should be resent
            expect(mockSendMessage).toHaveBeenCalledWith(
                '1234567890',
                mockMessage
            );

            // The current messages should have been sliced before retry
            expect(mockSetCurrentMessagesLocal).toHaveBeenCalled();
        });
    });

    it('logs error when createNewChatSession fails', async () => {
        const testError = new Error('Network failure');
        (createNewChatSession as jest.Mock).mockRejectedValue(testError);

        const { getByRole } = render(
            <ChatInput
                opsUserData={mockOpsUserData}
                setIsCompleted={jest.fn()}
            />
        );
        fireEvent.change(getByRole('textbox'), {
            target: { value: mockMessage },
        });
        fireEvent.click(getByRole('button', { name: /send-button/i }));

        await waitFor(() => {
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error sending message::',
                { error: testError }
            );
        });
    });
});