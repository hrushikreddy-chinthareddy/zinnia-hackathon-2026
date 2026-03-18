import { useUser } from '@auth0/nextjs-auth0/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UserContextMenu } from '@deps/components/user-context-menu/user-context-menu';

jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@deps/hooks/useTheme', () => ({
    useTheme: () => ({ carrierName: 'zinnia' }),
}));

jest.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: () => ({ showCommissions: false }),
}));

jest.mock('@deps/helpers/analytics/segment-analytics', () => ({
    segmentAnalyticsTrackEvent: jest.fn(),
}));

jest.mock('@deps/helpers/sessionStorage.helpers', () => ({
    storage: { clear: jest.fn() },
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

describe('UserContextMenu', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useUser as jest.Mock).mockReturnValue({
            user: { name: 'Doe, John', partyId: 'test-party-id' },
            isLoading: false,
            error: undefined,
        });
    });

    it('renders the trigger as a button element', () => {
        render(<UserContextMenu name="Doe, John" />);

        const trigger = screen.getByRole('button', {
            name: 'allFields.navLinksUserMenuFor',
        });
        expect(trigger).toBeInTheDocument();
        expect(trigger.tagName).toBe('BUTTON');
    });

    it('opens the menu with sign-out link as a menuitem on click', async () => {
        const user = userEvent.setup();
        render(<UserContextMenu name="Doe, John" />);

        const trigger = screen.getByRole('button', {
            name: 'allFields.navLinksUserMenuFor',
        });
        await user.click(trigger);

        const signOutLink = await screen.findByTestId('sign-out-link');
        expect(signOutLink).toBeInTheDocument();
    });
});
