import { fireEvent, render, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    listChatSessionsByClientId,
    searchChatHistory,
} from '@deps/queries/api/knowledge-base';
import { MeResponse, RoleEnum } from '@zinnia/api-types/types/knowledgebase';

import RecentChat from './recent-chat';

const mockBrowserLogError = jest.fn();
const mockViewChatHistory = jest.fn();
const mockPush = jest.fn();
let mockTrigger = 0;

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('@deps/queries/api/knowledge-base', () => ({
    listChatSessionsByClientId: jest.fn(),
    searchChatHistory: jest.fn(),
}));

jest.mock('@deps/contexts/KnowledgeBaseContext', () => ({
    useKnowledgeBaseContext: () => ({
        selectedClientId: 'client-123',
        chatHistoryReloadTrigger: mockTrigger,
        setChatHistoryReloadTrigger: jest.fn(),
        viewChatHistory: mockViewChatHistory,
    }),
}));

jest.mock('@deps/utils/browser-logging', () => {
    return {
        browserLogError: (...args: any[]) => mockBrowserLogError(...args),
    };
});

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockOpsUser: MeResponse = {
    id: '1234567890',
    name: 'Test',
    email: 'test@zinnia.com',
    role: RoleEnum.ASSOCIATE,
    client: [
        {
            id: 'client-123',
            name: 'Security Benefit.aspx',
            default: true,
            allowed: true,
        },
    ],
};

const mockChatSessions = [
    {
        sessionId: '1',
        sessionTitle: 'Chat session 1',
        lastActivity: new Date().toISOString(),
        messageCount: 4,
    },
];

describe('Recent Chat', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    it('renders client name and recent chat heading', async () => {
        const { getByText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        expect(getByText('sidenav.recentChat')).toBeInTheDocument();
        expect(
            getByText((content) => content.includes('Security Benefit'))
        ).toBeInTheDocument();
    });

    it('fetches selected client chat sessions on render', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: true,
        });
        const { getByText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                0,
                10
            );
            expect(
                getByText(mockChatSessions[0].sessionTitle)
            ).toBeInTheDocument();
        });
    });

    it('logs errors when it fails to fetch selected client chat sessions', async () => {
        const testError = new Error('Network failure');
        (listChatSessionsByClientId as jest.Mock).mockRejectedValue(testError);
        render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                0,
                10
            );
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error fetching chat history',
                { error: testError }
            );
        });
    });

    it('performs search on typing 3+ characters', async () => {
        (searchChatHistory as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: true,
        });
        const { getByPlaceholderText, getByText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );
        const searchInput = getByPlaceholderText('sidenav.search');

        fireEvent.change(searchInput, { target: { value: 'Chat' } });

        await waitFor(() => {
            expect(searchChatHistory).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                'Chat',
                0,
                10
            );
            expect(
                getByText(mockChatSessions[0].sessionTitle)
            ).toBeInTheDocument();
        });
    });

    it('does not perform search if there are less than 3 characters', async () => {
        const { getByPlaceholderText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );
        const searchInput = getByPlaceholderText('sidenav.search');

        fireEvent.change(searchInput, { target: { value: 'ab' } });

        await waitFor(() => {
            expect(searchChatHistory).not.toHaveBeenCalled();
        });
    });

    it('logs errors when it fails to fetch selected client chat sessions', async () => {
        const testError = new Error('Network failure');
        (searchChatHistory as jest.Mock).mockRejectedValue(testError);
        const { getByPlaceholderText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );
        const searchInput = getByPlaceholderText('sidenav.search');

        fireEvent.change(searchInput, { target: { value: 'Chat' } });

        await waitFor(() => {
            expect(searchChatHistory).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                'Chat',
                0,
                10
            );
            expect(mockBrowserLogError).toHaveBeenCalledWith(
                'Error searching chat history',
                { error: testError }
            );
        });
    });

    it('calls navigates on clicking an old chat session when on documents or admin page', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: false,
        });
        (useRouter as jest.Mock).mockReturnValue({
            pathname: '/zinnia-ai-assistant/documents',
            push: mockPush,
        });
        const { getByText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                0,
                10
            );
        });

        const chatItem = getByText(mockChatSessions[0].sessionTitle);
        fireEvent.click(chatItem);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                `/zinnia-ai-assistant/chat?sessionId=1`
            );
        });
    });

    it('calls viewChatHistory on clicking an old chat session when not on documents or admin page', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: false,
        });
        (useRouter as jest.Mock).mockReturnValue({
            pathname: '/zinnia-ai-assistant/chat',
            push: mockPush,
        });
        const { getByText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                0,
                10
            );
        });

        const chatItem = getByText(mockChatSessions[0].sessionTitle);
        fireEvent.click(chatItem);

        await waitFor(() => {
            expect(mockViewChatHistory).toHaveBeenCalledWith('1');
        });
    });

    it('fetches more chat sessions on scroll when not in search mode', async () => {
        const { container } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(async () => {
            expect(listChatSessionsByClientId).toHaveBeenCalledTimes(1);
        });
        const scrollContainer = container.querySelector('.h-\\[320px\\]');
        Object.defineProperty(scrollContainer!, 'scrollHeight', {
            value: 1000,
            writable: true,
        });
        Object.defineProperty(scrollContainer!, 'scrollTop', {
            value: 901,
            writable: true,
        });
        Object.defineProperty(scrollContainer!, 'clientHeight', {
            value: 10,
            writable: true,
        });

        fireEvent.scroll(scrollContainer!);

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledTimes(2); // initial + paginated
            expect(listChatSessionsByClientId).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                1,
                10
            );
        });
    });

    it('fetches more chat sessions on scroll when in search mode', async () => {
        (searchChatHistory as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: false,
        });
        const { getByPlaceholderText, container } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );
        const searchInput = getByPlaceholderText('sidenav.search');
        fireEvent.change(searchInput, { target: { value: 'Chat' } });

        await waitFor(async () => {
            expect(searchChatHistory).toHaveBeenCalledTimes(1);
        });

        const scrollContainer = container.querySelector('.h-\\[320px\\]');
        Object.defineProperty(scrollContainer!, 'scrollHeight', {
            value: 1000,
            writable: true,
        });
        Object.defineProperty(scrollContainer!, 'scrollTop', {
            value: 901,
            writable: true,
        });
        Object.defineProperty(scrollContainer!, 'clientHeight', {
            value: 10,
            writable: true,
        });

        fireEvent.scroll(scrollContainer!);

        await waitFor(() => {
            expect(searchChatHistory).toHaveBeenCalledTimes(2); // initial + paginated
            expect(searchChatHistory).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                'Chat',
                1,
                10
            );
        });
    });

    it('re-fetches the chat sessions when chatHistoryTrigger is changed', async () => {
        const { rerender } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledTimes(1);
        });
        mockTrigger = 1;
        rerender(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledTimes(2);
            expect(listChatSessionsByClientId).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                0,
                10
            );
        });
    });

    it('calls viewChatHistory on pressing Enter on a chat session', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: false,
        });
        (useRouter as jest.Mock).mockReturnValue({
            pathname: '/zinnia-ai-assistant/chat',
            push: mockPush,
        });
        const { getAllByRole } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );

        await waitFor(() => {
            expect(listChatSessionsByClientId).toHaveBeenCalledWith(
                mockOpsUser.email,
                mockOpsUser?.client?.[0]?.id,
                0,
                10
            );
        });

        const buttons = getAllByRole('button');
        const chatButton = buttons.find((btn) =>
            btn.textContent?.includes(mockChatSessions[0].sessionTitle)
        );

        expect(chatButton).toBeTruthy();

        if (chatButton) {
            chatButton.focus();
            fireEvent.keyDown(chatButton, {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
            });
            fireEvent.click(chatButton);
        }

        await waitFor(() => {
            expect(mockViewChatHistory).toHaveBeenCalledWith('1');
        });
    });

    it('focuses search input when isSearchFocused is true', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: true,
        });
        const { getByPlaceholderText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={true} />
        );
        const searchInput = getByPlaceholderText(
            'sidenav.search'
        ) as HTMLInputElement;

        await waitFor(() => {
            expect(searchInput).toHaveFocus();
        });
    });

    it('does not focus search input when isSearchFocused is false', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: true,
        });
        const { getByPlaceholderText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );
        const searchInput = getByPlaceholderText(
            'sidenav.search'
        ) as HTMLInputElement;

        await waitFor(() => {
            expect(searchInput).not.toHaveFocus();
        });
    });

    it('focuses search input when isSearchFocused is true', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: true,
        });
        const { getByPlaceholderText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={true} />
        );
        const searchInput = getByPlaceholderText(
            'sidenav.search'
        ) as HTMLInputElement;

        await waitFor(() => {
            expect(searchInput).toHaveFocus();
        });
    });

    it('does not focus search input when isSearchFocused is false', async () => {
        (listChatSessionsByClientId as jest.Mock).mockResolvedValue({
            content: mockChatSessions,
            last: true,
        });
        const { getByPlaceholderText } = render(
            <RecentChat opsUserData={mockOpsUser} isSearchFocused={false} />
        );
        const searchInput = getByPlaceholderText(
            'sidenav.search'
        ) as HTMLInputElement;

        await waitFor(() => {
            expect(searchInput).not.toHaveFocus();
        });
    });
});
