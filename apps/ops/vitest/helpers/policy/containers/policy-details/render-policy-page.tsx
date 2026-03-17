import { render } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import PolicySlug from '@deps/containers/policy-slug/policy-slug';
import { server } from '@vitest/mocks/node';
import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';
import {
    createTestWrapper,
    CreateTestWrapperOptions,
} from '@vitest/utils/create-test-wrapper';

import { createMockPolicyPageProps } from '../../shared/policy-test-fixtures';

const defaultProps = createMockPolicyPageProps();

type FeatureFlagOverrides = CreateTestWrapperOptions['featureFlags'];

/**
 * Renders the full PolicySlug container (policy-details route) with mock API responses.
 *
 * @param policyOverrides - Partial overrides merged onto `policyEndpointData` for the policy API response.
 * @param handlers - Additional MSW handlers registered **after** the default policy handler.
 *   Use these to override specific API endpoints (e.g. agent data, free-look eligibility).
 * @param featureFlags - Per-test Optimizely flag overrides. All flags are enabled by default;
 *   pass `{ [FEATURE_FLAGS.SOME_FLAG]: false }` to disable a specific flag.
 */
export const renderPolicyDetailsPage = (
    policyOverrides: Record<string, unknown> = {},
    handlers: Parameters<typeof server.use> = [],
    featureFlags: FeatureFlagOverrides = {}
) => {
    // Register the default policy handler first
    server.use(
        http.get('*/api/policies/:planCode/:policyId', ({ params }) =>
            HttpResponse.json({
                data: {
                    ...policyEndpointData,
                    policyNumber: String(params.policyId ?? 'POL123'),
                    product: {
                        ...policyEndpointData.product,
                        planCode: String(params.planCode ?? 'PLAN1'),
                    },
                    ...policyOverrides,
                },
            })
        )
    );

    // Register extra handlers AFTER so they take precedence (MSW prepends)
    if (handlers.length > 0) {
        server.use(...handlers);
    }

    return render(<PolicySlug {...defaultProps} />, {
        wrapper: createTestWrapper({ featureFlags }),
    });
};
