import { render, screen } from '@testing-library/react';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicySlug from '@deps/pages/policies/[planCode]/[id]/policy-slug';

import { createMockRouter, createMockPolicyPageProps } from './test-fixtures';
import { createTestWrapper } from '../../../../vitest/utils/create-test-wrapper';
import { server } from '../../../../vitest/vitest.setup';

let mockRouter = createMockRouter();

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
}));

// next-i18next uses its own i18next instance in non-Next.js environments;
// delegate to react-i18next so it reads from I18nextProvider instead.
vi.mock('next-i18next', async () => {
    const { useTranslation } = await import('react-i18next');
    return { useTranslation };
});

const defaultProps = createMockPolicyPageProps();

// Factory function to render with optional runtime handlers
const renderPolicyPage = (...runtimeHandlers: any[]) => {
    if (runtimeHandlers.length > 0) {
        server.use(...runtimeHandlers);
    }

    return render(<PolicySlug {...defaultProps} />, {
        wrapper: createTestWrapper(),
    });
};

describe('policy-details-page', () => {
    beforeEach(() => {
        // Reset to default router before each test
        mockRouter = createMockRouter();
    });

    describe('default slug behavior', () => {
        test('renders with Policy Details text when no slug is provided', async () => {
            // Override the router to have no slug
            mockRouter = createMockRouter({ slug: undefined });

            renderPolicyPage();

            // Verify component renders with Policy Details text (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });

        test('renders with Policy Details text when slug is empty array', async () => {
            // Override the router with empty slug array
            mockRouter = createMockRouter({ slug: [] });

            renderPolicyPage();

            // Verify component renders with Policy Details text (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });

    describe('policy slug', () => {
        test('renders PolicyDetailsContainer with policy data loaded', async () => {
            renderPolicyPage();

            // Verify PolicyDetailsContainer is rendered with data (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });
});
