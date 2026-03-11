import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, vi, beforeEach, test, expect } from 'vitest';


import {
    annuityPolicyOverrides,
    lifePolicyOverrides,
} from '@vitest/helpers/policy-overrides';
import { createMockRouter } from '@vitest/helpers/policy-test-fixtures';
import { renderPolicyDetailsPage } from '@vitest/helpers/render-policy-page';
import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';

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

beforeEach(() => {
    mockRouter = createMockRouter({ slug: ['policy', 'policy-details'] });
});

describe('policy-details route — status banners', () => {
    // ─── StatusBar layout variants ────────────────────────────────
    describe('StatusBar layout variants', () => {
        test('shows no banners for active policy with no open cases', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides);

            await screen.findByRole('heading', { name: 'Contract Details' });

            expect(screen.queryAllByTestId('banner-alert')).toHaveLength(0);
        });

        test('shows case count banner when policy has open cases', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides, [
                http.post('*/api/enterprise-search/v1/search', () =>
                    HttpResponse.json({
                        data: [
                            {
                                id: 'CASE-001',
                                policyNumber: 'POL123',
                                caseStatus: 'Open',
                                process: 'OFT',
                                carrier: 'GILICO',
                                productName: 'Guidepath 7',
                                createdAt: '2025-01-01T00:00:00Z',
                                updatedAt: '2025-01-02T00:00:00Z',
                            },
                            {
                                id: 'CASE-002',
                                policyNumber: 'POL123',
                                caseStatus: 'Open',
                                process: 'Renewal',
                                carrier: 'GILICO',
                                productName: 'Guidepath 7',
                                createdAt: '2025-02-01T00:00:00Z',
                                updatedAt: '2025-02-02T00:00:00Z',
                            },
                        ],
                        total: 2,
                    })
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
            renderPolicyDetailsPage(annuityPolicyOverrides, [
                http.post(
                    '*/api/bpm/v1/policies/:planCode/:policyId/freelookcancellation/eligibilitycheck',
                    () => HttpResponse.json({ status: 'success' })
                ),
            ]);

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
                ]
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
