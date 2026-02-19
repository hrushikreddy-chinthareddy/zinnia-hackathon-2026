import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, vi } from 'vitest';

import PolicyDetailsPage from '../../../../src/pages/policies/[planCode]/[id]/policy-details-page';

vi.mock('next/router', () => {
    const routerMock = {
        query: { id: 'POL123', planCode: 'PLAN1', slug: ['policy-details'] },
        pathname: '/policies/[planCode]/[id]/[...slug]',
        asPath: '/policies/PLAN1/POL123/policy-details',
        isReady: true,
        push: vi.fn(),
        replace: vi.fn(),
        events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    };
    return {
        default: routerMock,
        useRouter: () => routerMock,
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
        ready: true,
    }),
}));

vi.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: () => ({
        partyId: 'party-123',
        sessionId: 'session-123',
    }),
}));

vi.mock('@deps/hooks/useSegmentPageTracker', () => ({
    useSegmentPageTracker: vi.fn(),
}));

vi.mock('@deps/contexts/PeopleRolesFilter', () => ({
    PeopleRolesFilterProvider: ({ children }: any) => children,
}));

// next-i18next (CJS) is used by Custom404Page and other transitive deps
vi.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
        ready: true,
    }),
}));

// OptimizelyContext is used by PolicyDetailsPage
vi.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: () => ({
        featureFlags: {},
    }),
}));

const defaultProps = {
    subPageTitleKey: 'policyDetails',
    policy: {} as any,
    permissions: {} as any,
    user: {
        nickname: 'testuser',
        name: 'Test User',
        picture: '',
        updated_at: '',
        email: 'test@example.com',
        email_verified: true,
        sid: 'session-123',
        sub: 'auth0|123',
        partyId: 'party-123',
        user_metadata: { communication_mode: 'email' },
        app_metadata: { company: 'TestCo' },
    } as any,
};

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    }

    return Wrapper;
}

describe('policy-details-page (browser mode)', () => {
    test('renders initial loading UI', async () => {
        render(<PolicyDetailsPage {...defaultProps} />, {
            wrapper: createWrapper(),
        });

        await screen.findByRole('progressbar');
    });
});
