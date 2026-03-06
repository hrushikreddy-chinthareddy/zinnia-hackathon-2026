import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicySlug from '@deps/containers/policy-slug/policy-slug';
import { server } from '@vitest/mocks/node';
import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';
import {
    createTestWrapper,
    CreateTestWrapperOptions,
} from '@vitest/utils/create-test-wrapper';

import {
    createMockRouter,
    createMockPolicyPageProps,
} from './helpers/policy-test-fixtures';

let mockRouter = createMockRouter({ slug: ['policy', 'policy-details'] });

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
    default: {
        query: {},
        push: () => Promise.resolve(true),
        replace: () => Promise.resolve(true),
        prefetch: () => Promise.resolve(),
        back: () => {},
    },
}));

const defaultProps = createMockPolicyPageProps();

type FeatureFlagOverrides = CreateTestWrapperOptions['featureFlags'];

const renderPolicyDetailsPage = (
    policyOverrides: Record<string, unknown> = {},
    handlers: Parameters<typeof server.use> = [],
    featureFlags: FeatureFlagOverrides = {}
) => {
    if (handlers.length > 0) {
        server.use(...handlers);
    }

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

    return render(<PolicySlug {...defaultProps} />, {
        wrapper: createTestWrapper({ featureFlags }),
    });
};

// Annuity base data — mirrors what policyEndpointData already has (lineOfBusiness: ANNUITY)
const annuityPolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'ANNUITY',
        productType: 'FIXEDINDEXEDANNUITY',
    },
};

// Life base data — override the default ANNUITY mock to LIFE
const lifePolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'LIFE',
        productType: 'UNIVERSALLIFE',
    },
};

beforeEach(() => {
    mockRouter = createMockRouter({ slug: ['policy', 'policy-details'] });
});

describe('policy-details route', () => {
    // ─── StatusBar layout variants ────────────────────────────────
    describe('StatusBar layout variants', () => {
        test('shows no banners for active policy with no open cases', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides);

            await screen.findByRole('heading', { name: 'Contract Details' });

            expect(
                screen.queryByText(/This policy has \d+ open case/)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(
                    'This policy needs a payment before it lapses. Go there now?'
                )
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(
                    'This policy is approved for a reinstatement premium.  Go there now?'
                )
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(/This policy has a free look period/)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText('Initial Death Notification')
            ).not.toBeInTheDocument();
        });

        test('shows case count banner when policy has open cases', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides, [
                http.post('*/api/case/v1/cases/search', () =>
                    HttpResponse.json({ data: [], total: 2 })
                ),
            ]);

            expect(
                await screen.findByText('This policy has 2 open cases')
            ).toBeInTheDocument();
            expect(await screen.findByText('View cases')).toBeInTheDocument();
        });

        test('shows PENDINGLAPSE warning banner when policyStatus is PENDINGLAPSE', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyStatus: 'PENDINGLAPSE',
            });

            expect(
                await screen.findByText(
                    'This policy needs a payment before it lapses. Go there now?'
                )
            ).toBeInTheDocument();
            expect(
                await screen.findByText('Make a premium payment')
            ).toBeInTheDocument();
        });

        test('shows LAPSE error banner when policyStatus is LAPSE and reinstatement has approvalDate', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyStatus: 'LAPSE',
                policyFeatures: [
                    ...policyEndpointData.policyFeatures,
                    {
                        featureType: 'REINSTATEMENT',
                        approvalDate: '2024-01-15',
                        endDate: '2024-06-30',
                        period: 3,
                    },
                ],
            });

            expect(
                await screen.findByText(/approved for a reinstatement premium/)
            ).toBeInTheDocument();
            expect(
                await screen.findByText('Make a premium payment')
            ).toBeInTheDocument();
        });

        test('does not show LAPSE banner when policyStatus is LAPSE but no reinstatement approvalDate', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyStatus: 'LAPSE',
                policyFeatures: [],
            });

            await screen.findByRole('heading', { name: 'Contract Details' });

            expect(
                screen.queryByText(
                    'This policy is approved for a reinstatement premium.  Go there now?'
                )
            ).not.toBeInTheDocument();
        });

        test('shows freeLook banner when feature flag is enabled and policy is in free look period', async () => {
            renderPolicyDetailsPage(
                annuityPolicyOverrides,
                [
                    http.post(
                        '*/api/bpm/v1/policies/:planCode/:policyId/freelookcancellation/eligibilitycheck',
                        () => HttpResponse.json({ status: 'success' })
                    ),
                ],
                {
                    'policy-management_feature_free-look-cancellation': true,
                }
            );

            expect(
                await screen.findByText(/This policy has a free look period/)
            ).toBeInTheDocument();
            expect(
                await screen.findByText('Cancel policy')
            ).toBeInTheDocument();
        });

        test('shows initial death notification banner when carrierId matches enabled flag and death claim not yet created', async () => {
            renderPolicyDetailsPage(
                {
                    ...lifePolicyOverrides,
                    carrierId: 'FLIC',
                },
                [
                    http.get(
                        '*/api/webnonfinancial/claim/v1/initialdeathclaim/exists',
                        () =>
                            HttpResponse.json({
                                isNewRequest: false,
                                zlCaseId: 'CASE-123',
                            })
                    ),
                ],
                { 'claims-feature-flic-idn-death-claim': true }
            );

            expect(
                await screen.findByText('Initial Death Notification')
            ).toBeInTheDocument();
            expect(
                await screen.findByText('View death claim progress')
            ).toBeInTheDocument();
        });
    });
});
