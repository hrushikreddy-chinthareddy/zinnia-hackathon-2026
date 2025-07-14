import { renderHook } from '@testing-library/react';
import React from 'react';

import { useMainNavItems } from './useMainNavItems';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const map: Record<string, string> = {
                'site.navLinks.home.text': 'Home',
                'site.navLinks.home.link': '/home',
                'site.navLinks.caseManagement.text': 'Case Management',
                'site.navLinks.caseManagement.link': '/cases',
                'site.navLinks.policySearch.text': 'Policy Search',
                'site.navLinks.policySearch.link': '/policies',
                'site.navLinks.transactionOpsSuite.text': 'Transactions',
                'site.navLinks.transactionOpsSuite.link': '/transactions',
                'site.navLinks.dashboard.text': 'Dashboard',
                'site.navLinks.dashboard.link': '/dashboard',
                'site.navLinks.accessManagement.text': 'Access Management',
                'site.navLinks.marketingStorefront.text': 'Storefront',
                'site.navLinks.marketingStorefront.link': '/storefront',
            };
            return map[key] || key;
        },
    }),
}));

jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: () => ({
        user: { name: 'Test User', partyId: 'user-123' },
    }),
}));

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: () => ({
        featureFlags: {
            [require('@deps/utils/optimizely/flags').FEATURE_FLAGS
                .SHOW_HOME_NAV_BTN]: true,
        },
        featureFlagVariables: {},
    }),
}));

jest.mock('@deps/helpers/analytics/segment-analytics', () => ({
    segmentAnalyticsTrackEvent: jest.fn(),
}));

jest.mock('@deps/components/nav-element/nav-link/nav-link', () => ({
    __esModule: true,
    default: ({ href }: { href: string }) =>
        React.createElement('a', { href }, 'MockNavLink'),
}));

jest.mock('@deps/components/user-context-menu/user-context-menu', () => ({
    UserContextMenu: ({ name }: { name: string }) =>
        React.createElement('div', null, `MockUserMenu: ${name}`),
}));

const defaultPermissions = {
    hasDashboardPermission: true,
    isAdvisorsExcel: true,
    isAllowReadCaseManagement: true,
    isAllowReadOtpRenewals: false,
    isAllowReadPolicyAdmin: true,
    permissionsLoadingComplete: true,
    isSuperAdmin: false,
    hasHomeExperience: true,
    showToppanMerrill: false,
    hasCaseInsightPermission: false,
    isCallLogAudioPermitted: false,
    sessionId: 's1',
    partyId: 'p1',
    bulkCheckComplete: true,
    fgaRolesData: [],
};

jest.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: jest.fn(() => defaultPermissions),
}));

describe('useMainNavItems', () => {
    it('returns expected nav items based on mocked permissions and flags', () => {
        const { result } = renderHook(() => useMainNavItems());

        const navGroups = result.current;

        // First group: Home, Case Mgmt, Policy
        expect(navGroups[0].items.map((i) => i.display)).toEqual([
            'Home',
            'Case Management',
            'Policy Search',
        ]);
    });

    it('returns empty array if permissionsLoadingComplete is false', () => {
        const permissionsModule = require('@deps/contexts/PermissionsContext');
        permissionsModule.usePermissionsContext.mockReturnValueOnce({
            ...defaultPermissions,
            permissionsLoadingComplete: false,
        });

        const { result } = renderHook(() => useMainNavItems());
        expect(result.current).toEqual([]);
    });
});
