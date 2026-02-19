import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, vi } from 'vitest';

import commonEn from '../../../../public/locales/en/common.json';
import PolicyDetailsPage from '../../../../src/pages/policies/[planCode]/[id]/policy-details-page';

const i18nInstance = i18next.createInstance();
i18nInstance.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    resources: {
        en: { common: commonEn },
    },
    interpolation: { escapeValue: false },
});

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

// next-i18next uses its own i18next instance in non-Next.js environments;
// delegate to react-i18next so it reads from I18nextProvider instead.
vi.mock('next-i18next', async () => {
    const { useTranslation } = await import('react-i18next');
    return { useTranslation };
});

vi.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: () => ({
        partyId: 'party-123',
        sessionId: 'session-123',
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
            <I18nextProvider i18n={i18nInstance}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </I18nextProvider>
        );
    }

    return Wrapper;
}

describe('policy-details-page (browser mode)', () => {
    test('renders policy details heading after data loads', async () => {
        render(<PolicyDetailsPage {...defaultProps} />, {
            wrapper: createWrapper(),
        });

        await screen.findByText('Policy Details');
    });
});
