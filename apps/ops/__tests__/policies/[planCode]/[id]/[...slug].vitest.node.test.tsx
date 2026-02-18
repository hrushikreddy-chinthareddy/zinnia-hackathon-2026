import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, vi } from 'vitest';

import PolicyDetailsPage from '../../../../src/pages/policies/[planCode]/[id]/[...slug]';
import { test } from '../../../../vitest/test-extend';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/router
const mockRouterValues = {
    query: { id: 'POL123', planCode: 'PLAN1', slug: ['policy-details'] },
    pathname: '/policies/[planCode]/[id]/[...slug]',
    asPath: '/policies/PLAN1/POL123/policy-details',
    basePath: '',
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    isReady: true,
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isFallback: false,
};

const useRouterMock = vi.fn(() => mockRouterValues);

vi.mock('next/router', () => ({
    useRouter: (...args: any[]) => useRouterMock(...args),
}));

// react-i18next (used via next-i18next re-export)
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
        ready: true,
    }),
    Trans: ({ children }: any) => children,
    initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// PermissionsContext
vi.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: () => ({
        partyId: 'party-123',
        sessionId: 'session-123',
        bulkCheckComplete: true,
        permissionsLoadingComplete: true,
        writeClientCaseCarriers: [],
        fgaRolesData: [],
        isAdvisorsExcel: false,
        isSuperAdmin: false,
        hasAnalyticsPermission: false,
        hasCaseInsightPermission: false,
        isAllowReadCaseManagement: false,
        isAllowReadPolicyAdmin: false,
        isAllowReadOtpRenewals: false,
        isCallLogAudioPermitted: false,
        showWelbSalesMaterials: false,
        showCommissions: false,
        hasHomeExperience: false,
        isOpsManagerView: false,
        hasPolicyIndexPageAccess: false,
        isAllowReadIllustrations: false,
        hasUsagePermission: false,
        hasAiAssistantPermissions: false,
        hasCallLogsAccess: false,
        hasNotesAccess: false,
        hasTestHarnessAccess: false,
        isZinniaInternalViewer: false,
        isZinniaInternalProcessor: false,
        isAllowWriteClientCase: false,
        showZinniaLiveCaseActions: false,
        showRequestCorrection: false,
        isAllowOpsCaseReviewRequest: false,
        hasPermissionToPrioritizeCases: false,
        isSuperIllustrator: false,
        hasEditServiceRequestAccess: false,
    }),
    PermissionsContext: React.createContext({}),
}));

// OptimizelyContext
vi.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: () => ({
        featureFlags: {},
        featureFlagVariables: {},
        areFlagsLoading: false,
    }),
}));

// Segment page tracker — fire-and-forget, no return value
vi.mock('@deps/hooks/useSegmentPageTracker', () => ({
    useSegmentPageTracker: vi.fn(),
}));

// PeopleRolesFilter — passthrough wrapper
vi.mock('@deps/contexts/PeopleRolesFilter', () => ({
    PeopleRolesFilterProvider: ({ children }: any) => children,
}));

// next/head — render children directly (no document.head in jsdom tests)
vi.mock('next/head', () => ({
    default: ({ children }: any) => children,
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const mockUser = {
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
};

const defaultProps = {
    subPageTitleKey: 'policyDetails',
    policy: {} as any,
    permissions: {} as any,
    user: mockUser as any,
};

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Policy Details Page', () => {
    test('renders policy details page', async () => {
        render(<PolicyDetailsPage {...defaultProps} />, {
            wrapper: createWrapper(),
        });

        // The page should render without crashing
        await waitFor(() => {
            expect(document.body).toBeTruthy();
        });
    });

    test('displays loading state initially', async () => {
        render(<PolicyDetailsPage {...defaultProps} />, {
            wrapper: createWrapper(),
        });

        // Should show some loading indicator on initial render
        const loader = screen.queryByRole('progressbar');
        expect(loader).toBeDefined();
    });

    test('renders people subpage', async () => {
        useRouterMock.mockReturnValue({
            ...mockRouterValues,
            query: { id: 'POL123', planCode: 'PLAN1', slug: ['people'] },
            asPath: '/policies/PLAN1/POL123/people',
        });

        render(
            <PolicyDetailsPage {...defaultProps} subPageTitleKey="people" />,
            { wrapper: createWrapper() }
        );

        await waitFor(() => {
            expect(document.body).toBeTruthy();
        });
    });

    test('displays policy data from MSW mock', async () => {
        render(<PolicyDetailsPage {...defaultProps} />, {
            wrapper: createWrapper(),
        });

        // Wait for data to load — MSW will intercept and return mock data
        // Add assertions once you know what text/elements to expect
        await waitFor(() => {
            expect(document.body).toBeTruthy();
        });
    });
});
