import { act, render, fireEvent, waitFor } from '@testing-library/react';
import router from 'next/router';

import KnowledgeBaseContainer from '@deps/containers/knowledge-base/knowledge-base-container';
import { useScreenSize } from '@deps/hooks/useScreenSize';
import { MeResponse } from '@zinnia/api-types/types/knowledgebase';

jest.mock('next/router', () => ({
    __esModule: true,
    default: {
        events: {
            on: jest.fn(),
            off: jest.fn(),
        },
    },
}));

jest.mock('@deps/hooks/useScreenSize', () => ({
    useScreenSize: jest.fn(),
}));

jest.mock(
    '@deps/components/knowledge-base/knowledge-base-sidenav/knowledge-base-sidenav',
    () => {
        return function MockKnowledgeBaseSidenav({
            isNavCollapsed,
            setIsNavCollapsed,
        }: {
            isNavCollapsed: boolean;
            setIsNavCollapsed: (value: boolean) => void;
        }) {
            return (
                <div data-testid="knowledge-base-sidenav">
                    <div data-testid="is-nav-collapsed">
                        {isNavCollapsed ? 'collapsed' : 'expanded'}
                    </div>
                    <button
                        data-testid="toggle-nav"
                        onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                    >
                        Toggle Nav
                    </button>
                </div>
            );
        };
    }
);

jest.mock('@deps/contexts/KnowledgeBaseContext', () => {
    return {
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="knowledge-base-provider">{children}</div>
        ),
    };
});

const mockOpsUserData: MeResponse = {
    id: '1234567890',
    name: 'Test User',
    email: 'test@zinnia.com',
    role: MeResponse.role.ASSOCIATE,
    client: [
        {
            id: 'client-123',
            name: 'Test Client',
            default: true,
            allowed: true,
        },
    ],
};

describe('KnowledgeBaseContainer', () => {
    const mockOn = jest.fn();
    const mockOff = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (router.events.on as jest.Mock) = mockOn;
        (router.events.off as jest.Mock) = mockOff;
    });

    it('renders children and KnowledgeBaseSidenav', () => {
        (useScreenSize as jest.Mock).mockReturnValue(false);

        const { getByText, getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        expect(getByText('Test Children')).toBeInTheDocument();
        expect(getByTestId('knowledge-base-sidenav')).toBeInTheDocument();
    });

    it('initializes isNavCollapsed to true when screen is small', () => {
        (useScreenSize as jest.Mock).mockReturnValue(false);

        const { getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        expect(getByTestId('is-nav-collapsed')).toHaveTextContent('collapsed');
    });

    it('initializes isNavCollapsed to false when screen is large', () => {
        (useScreenSize as jest.Mock).mockReturnValue(true);

        const { getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        expect(getByTestId('is-nav-collapsed')).toHaveTextContent('expanded');
    });

    it('passes setIsNavCollapsed to KnowledgeBaseSidenav and allows toggling', () => {
        (useScreenSize as jest.Mock).mockReturnValue(true);

        const { getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        const toggleButton = getByTestId('toggle-nav');
        const navState = getByTestId('is-nav-collapsed');

        expect(navState).toHaveTextContent('expanded');

        fireEvent.click(toggleButton);
        expect(navState).toHaveTextContent('collapsed');

        fireEvent.click(toggleButton);
        expect(navState).toHaveTextContent('expanded');
    });

    it('sets up route change listener on mount', () => {
        (useScreenSize as jest.Mock).mockReturnValue(false);

        render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        expect(mockOn).toHaveBeenCalledWith(
            'routeChangeComplete',
            expect.any(Function)
        );
    });

    it('cleans up route change listener on unmount', () => {
        (useScreenSize as jest.Mock).mockReturnValue(false);

        const { unmount } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        unmount();

        expect(mockOff).toHaveBeenCalledWith(
            'routeChangeComplete',
            expect.any(Function)
        );
    });

    it('collapses nav on route change when screen is small and nav is expanded', async () => {
        (useScreenSize as jest.Mock).mockReturnValue(false);

        const { getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        expect(getByTestId('is-nav-collapsed')).toHaveTextContent('collapsed');

        // Expand the nav first
        const toggleButton = getByTestId('toggle-nav');
        fireEvent.click(toggleButton);
        expect(getByTestId('is-nav-collapsed')).toHaveTextContent('expanded');

        const routeChangeHandler = mockOn.mock.calls.find(
            (call) => call[0] === 'routeChangeComplete'
        )?.[1];

        act(() => {
            routeChangeHandler?.();
        });

        await waitFor(() => {
            expect(getByTestId('is-nav-collapsed')).toHaveTextContent(
                'collapsed'
            );
        });
    });

    it('does not collapse nav on route change when screen is large', () => {
        (useScreenSize as jest.Mock).mockReturnValue(true);

        const { getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        const navState = getByTestId('is-nav-collapsed');
        expect(navState).toHaveTextContent('expanded');

        const routeChangeHandler = mockOn.mock.calls.find(
            (call) => call[0] === 'routeChangeComplete'
        )?.[1];

        act(() => {
            routeChangeHandler?.();
        });

        expect(navState).toHaveTextContent('expanded');
    });

    it('does not collapse nav on route change when already collapsed', () => {
        (useScreenSize as jest.Mock).mockReturnValue(false);

        const { getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );

        expect(getByTestId('is-nav-collapsed')).toHaveTextContent('collapsed');

        const routeChangeHandler = mockOn.mock.calls.find(
            (call) => call[0] === 'routeChangeComplete'
        )?.[1];

        act(() => {
            routeChangeHandler?.();
        });

        expect(getByTestId('is-nav-collapsed')).toHaveTextContent('collapsed');
    });

    it('initializes nav state based on screen size on mount', () => {
        (useScreenSize as jest.Mock).mockReturnValue(false);
        const { unmount, getByTestId } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );
        expect(getByTestId('is-nav-collapsed')).toHaveTextContent('collapsed');
        unmount();

        (useScreenSize as jest.Mock).mockReturnValue(true);
        const { getByTestId: getByTestId2 } = render(
            <KnowledgeBaseContainer opsUserData={mockOpsUserData}>
                <div>Test Children</div>
            </KnowledgeBaseContainer>
        );
        expect(getByTestId2('is-nav-collapsed')).toHaveTextContent('expanded');
    });
});
