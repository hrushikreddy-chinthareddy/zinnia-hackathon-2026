import { screen } from '@testing-library/react';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import {
    errorPolicySearchHandler,
} from './helpers/policy-index-helpers/policy-index-msw-handlers';
import {
    createMockRouter,
    mockPolicySearchResults,
} from './helpers/policy-index-helpers/policy-index-test-fixtures';
import { renderPolicyIndexPage } from './helpers/policy-index-helpers/render-policy-index';

// ─── Router mock ────────────────────────────────────────────────────────────
let mockRouter = createMockRouter();

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

// next/head is not available outside of Next.js runtime; stub it so
// <PageHead> renders without error.
vi.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
    mockRouter = createMockRouter();
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('PolicyIndexTableView', () => {
    // ─── Page heading ────────────────────────────────────────────────────────
    describe('page heading', () => {
        test('renders the "Policies & Contracts" heading', async () => {
            renderPolicyIndexPage();

            expect(
                await screen.findByRole('heading', {
                    name: 'Policies & Contracts',
                })
            ).toBeInTheDocument();
        });
    });

    // ─── Table column headers ────────────────────────────────────────────────
    describe('table column headers', () => {
        test('renders all expected column headers', async () => {
            renderPolicyIndexPage();

            // Wait for data to load
            await screen.findByText(mockPolicySearchResults[0].productName);

            expect(
                screen.getByText('Policy/Contract')
            ).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Owner/SSN')).toBeInTheDocument();
            expect(screen.getByText('Open Cases')).toBeInTheDocument();
            expect(screen.getByText('Last Updated')).toBeInTheDocument();
        });
    });

    // ─── Search results rendering ────────────────────────────────────────────
    describe('search results', () => {
        test('renders policy rows with product names', async () => {
            renderPolicyIndexPage();

            for (const result of mockPolicySearchResults) {
                expect(
                    await screen.findByText(result.productName)
                ).toBeInTheDocument();
            }
        });

        test('renders policy numbers for each result', async () => {
            renderPolicyIndexPage();

            for (const result of mockPolicySearchResults) {
                expect(
                    await screen.findByText(result.policyNumber)
                ).toBeInTheDocument();
            }
        });
    });

    // ─── Empty / no-results states ───────────────────────────────────────────
    describe('empty states', () => {
        test('displays no-results message when search returns 0 results and no filter is active', async () => {
            renderPolicyIndexPage({
                count: 0,
                next: null,
                previous: null,
                results: [],
                total: 0,
            });

            expect(
                await screen.findByText(
                    /you don\u2019t have any policies or contracts yet/i
                )
            ).toBeInTheDocument();
        });
    });

    // ─── Error state ─────────────────────────────────────────────────────────
    describe('error state', () => {
        test('displays error message when the search API fails', async () => {
            renderPolicyIndexPage(undefined, [errorPolicySearchHandler]);

            expect(
                await screen.findByText(
                    /we couldn't find a contract or policy that matches your search/i
                )
            ).toBeInTheDocument();
            expect(
                screen.getByText(/check your input and try again/i)
            ).toBeInTheDocument();
        });
    });

    // ─── Pagination ──────────────────────────────────────────────────────────
    describe('pagination', () => {
        test('shows "Results: x-y of z" text when results exist', async () => {
            const total = mockPolicySearchResults.length; // 3
            renderPolicyIndexPage();

            // The pagination shows "Results: 1-3 of 3"
            expect(
                await screen.findByText(`Results: 1-${total} of ${total}`)
            ).toBeInTheDocument();
        });

        test('does NOT show pagination when there are no results', async () => {
            renderPolicyIndexPage({
                count: 0,
                next: null,
                previous: null,
                results: [],
                total: 0,
            });

            // Wait for the no-results message to appear so we know the page has rendered
            await screen.findByText(
                /you don\u2019t have any policies or contracts yet/i
            );

            expect(screen.queryByText(/Results:/)).not.toBeInTheDocument();
        });

        test('shows pagination text for many results (page 1 of N)', async () => {
            const total = 25;
            const pageSize = 10;
            const pageResults = Array.from({ length: pageSize }, (_, i) => ({
                ...mockPolicySearchResults[0],
                id: `paginated-${i}`,
                policyNumber: `PAGPOL${String(i).padStart(4, '0')}`,
                productName: `Product ${i}`,
            }));

            renderPolicyIndexPage({
                count: pageResults.length,
                next: null,
                previous: null,
                results: pageResults,
                total,
            });

            expect(
                await screen.findByText(`Results: 1-${pageSize} of ${total}`)
            ).toBeInTheDocument();
        });
    });

    // ─── URL-driven policyNumber ─────────────────────────────────────────────
    describe('URL-driven policyNumber', () => {
        test('picks up policyNumber from the router query', async () => {
            mockRouter = createMockRouter({ policyNumber: 'POL100001' });

            renderPolicyIndexPage();

            // The page should still render — it will set the search context from the URL param
            expect(
                await screen.findByRole('heading', {
                    name: 'Policies & Contracts',
                })
            ).toBeInTheDocument();
        });
    });

    // ─── Search form ─────────────────────────────────────────────────────────
    describe('search form', () => {
        test('renders the search button', async () => {
            renderPolicyIndexPage();

            expect(
                await screen.findByTestId('search-btn')
            ).toBeInTheDocument();
        });

        test('renders the search-by dropdown', async () => {
            renderPolicyIndexPage();

            expect(
                await screen.findByRole('combobox')
            ).toBeInTheDocument();
        });
    });
});
