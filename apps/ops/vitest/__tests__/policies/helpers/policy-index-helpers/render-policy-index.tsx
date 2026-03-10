import { render } from '@testing-library/react';

import { PolicyIndexTableView } from '@deps/components/policy-index/policy-index-table-view';
import { PolicySearchFiltersProvider } from '@deps/contexts/PolicySearchFilters';
import { SearchBarProvider } from '@deps/contexts/SearchBarContext';
import { server } from '@vitest/mocks/node';
import {
    createTestWrapper,
    CreateTestWrapperOptions,
} from '@vitest/utils/create-test-wrapper';

import { policySearchHandler } from './policy-index-msw-handlers';
import { createMockUser } from './policy-index-test-fixtures';

import type { PolicyReferenceSearchResponse } from '@deps/types/search';

type FeatureFlagOverrides = CreateTestWrapperOptions['featureFlags'];

const defaultUser = createMockUser();

/**
 * Renders the `PolicyIndexTableView` component wrapped in all required providers.
 *
 * @param searchData     – Custom policy-search response data.  Defaults to the
 *                         standard mock results from the fixtures file.
 * @param handlers       – Additional MSW request handlers registered **before**
 *                         the default policy-search handler.
 * @param featureFlags   – Per-test Optimizely flag overrides.
 * @param routerQuery    – Query params passed to the mock Next.js router (e.g.
 *                         `{ policyNumber: 'POL123' }` to simulate a URL-driven
 *                         search).
 */
export const renderPolicyIndexPage = (
    searchData?: PolicyReferenceSearchResponse,
    handlers: Parameters<typeof server.use> = [],
    featureFlags: FeatureFlagOverrides = {}
) => {
    // Register the default policy search handler first
    server.use(
        searchData ? policySearchHandler(searchData) : policySearchHandler()
    );

    // Register extra handlers AFTER so they take precedence (MSW prepends)
    if (handlers.length > 0) {
        server.use(...handlers);
    }

    const TestWrapper = createTestWrapper({ featureFlags });

    return render(
        <TestWrapper>
            <SearchBarProvider>
                <PolicySearchFiltersProvider>
                    <PolicyIndexTableView user={defaultUser} />
                </PolicySearchFiltersProvider>
            </SearchBarProvider>
        </TestWrapper>
    );
};
