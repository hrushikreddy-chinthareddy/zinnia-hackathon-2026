import { type ReactNode } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import {
    createSpyPolicySearchHandler,
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
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
    mockRouter = createMockRouter();
    // PolicySearchFiltersProvider persists filters to sessionStorage.
    // Clear it so stale toggle / search values don't leak between tests.
    window.sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('PolicyIndexTableView', () => {



    // ─── Search results rendering ────────────────────────────────────────────
    describe('search results', () => {
        test('renders all expected column data for a result row', async () => {
            renderPolicyIndexPage();

            const result = mockPolicySearchResults[0];
            await screen.findByText(result.productName);

            // Scope to the first data row (skip header)
            const row = within(screen.getAllByRole('row')[1]);

            // Policy/Contract column
            expect(row.getByText(result.productName)).toBeInTheDocument();
            expect(row.getByText(result.policyNumber)).toBeInTheDocument();

            // Status (mock policy endpoint returns ACTIVE → "Active")
            expect(await row.findByText('Active')).toBeInTheDocument();

            // Owner / SSN
            const expectedOwner = `${result.firstName} ${result.lastName}`;
            expect(await row.findByText(expectedOwner)).toBeInTheDocument();
            const last4 = result.ssn!.replace(/\D/g, '').slice(-4);
            expect(row.getByText(`***-**-${last4}`)).toBeInTheDocument();

            // Open Cases (mock returns 0 → "--")
            expect(row.getByText('--')).toBeInTheDocument();

            // Last Updated (M/D/YYYY)
            const d = new Date(result.lastUpdated);
            expect(
                row.getByText(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`)
            ).toBeInTheDocument();
        });
    });

    // ─── Empty / no-results states ───────────────────────────────────────────
    describe('empty states', () => {
        test('displays no-results message when search returns 0 results and no filter is active', async () => {
            renderPolicyIndexPage({
                count: 0,
                next: '',
                previous: '',
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
                next: '',
                previous: '',
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
                next: '',
                previous: '',
                results: pageResults,
                total,
            });

            expect(
                await screen.findByText(`Results: 1-${pageSize} of ${total}`)
            ).toBeInTheDocument();

            // Pagination nav and controls
            const paginationNav = within(
                screen.getByRole('navigation', { name: 'Pagination' })
            );

            // Page number buttons (25 total / 10 per page = 3 pages)
            // Two sets are rendered (md and sm breakpoints), so use getAllByRole
       
            expect(
                paginationNav.getAllByRole('button', { name: 'Page 3' }).length
            ).toBeGreaterThanOrEqual(1);

            // Arrow navigation (arrows have role="navigation" on the button element)
            expect(paginationNav.getByTestId('arrow-left')).toBeInTheDocument();
            expect(paginationNav.getByTestId('arrow-right')).toBeInTheDocument();



        });
    });

    // ─── Search functionality ────────────────────────────────────────────────
    describe('search functionality', () => {
        test('submitting a policy number search sends the value to the API', async () => {
            const user = userEvent.setup();
            const { handler, calls } = createSpyPolicySearchHandler();

            renderPolicyIndexPage(undefined, [handler]);

            // Wait for initial load
            await screen.findByText(mockPolicySearchResults[0].productName);

            // The default toggle is "policyNumber" – type into the input and submit
            const input = screen.getByPlaceholderText(
                'Policy or contract number'
            );
            await user.clear(input);
            await user.type(input, 'POL999');
            await user.click(screen.getByTestId('search-btn'));

            // The most recent API call should contain the policy number in the body
            const lastCall = calls.at(-1);
            expect(lastCall).toBeDefined();
            expect(lastCall!.body).toMatchObject({
                policyNumber: 'POL999',
            });
        });



        test('submitting an empty search shows a field error message', async () => {
            const user = userEvent.setup();

            renderPolicyIndexPage();

            // Wait for initial load
            await screen.findByText(mockPolicySearchResults[0].productName);

            // Clear the input (should already be empty) and click search
            const input = screen.getByPlaceholderText(
                'Policy or contract number'
            );
            await user.clear(input);
            await user.click(screen.getByTestId('search-btn'));

            // The SearchBarContext's validateValueToSearch sets showFieldErrorMessage
            // which causes the SearchField to render an error AssistiveText
            expect(
                await screen.findByText(
                    /enter a policy\/contract number to return search results/i
                )
            ).toBeInTheDocument();
        });

        test('search resets pagination offset to 0', async () => {
            const user = userEvent.setup();
            const { handler, calls } = createSpyPolicySearchHandler();

            renderPolicyIndexPage(undefined, [handler]);

            await screen.findByText(mockPolicySearchResults[0].productName);

            const input = screen.getByPlaceholderText(
                'Policy or contract number'
            );
            await user.clear(input);
            await user.type(input, 'POL123');
            await user.click(screen.getByTestId('search-btn'));

            const lastCall = calls.at(-1);
            expect(lastCall).toBeDefined();
            expect(lastCall!.searchParams.get('offset')).toBe('0');
        });
    });

    // ─── SSN search ──────────────────────────────────────────────────────────
    describe('SSN search', () => {
        test('switching to SSN and searching sends ssn to the API with dashes stripped', async () => {
            const user = userEvent.setup();
            const { handler, calls } = createSpyPolicySearchHandler();

            renderPolicyIndexPage(undefined, [handler]);

            await screen.findByText(mockPolicySearchResults[0].productName);

            // Open the "Search by" dropdown and select "SSN"
            const dropdown = screen.getByRole('combobox');
            await user.click(dropdown);
            const ssnOption = await screen.findByText('SSN');
            await user.click(ssnOption);

            // The input should now show the SSN placeholder
            const ssnInput =
                await screen.findByPlaceholderText('###-##-####');
            await user.type(ssnInput, '123-45-6789');
            await user.click(screen.getByTestId('search-btn'));

            // getPoliciesQuery strips dashes before sending to the API
            const lastCall = calls.at(-1);
            expect(lastCall).toBeDefined();
            expect(lastCall!.body).toMatchObject({ ssn: '123456789' });
        });

        test('submitting an empty SSN search shows an SSN error message', async () => {
            const user = userEvent.setup();

            renderPolicyIndexPage();

            await screen.findByText(mockPolicySearchResults[0].productName);

            // Switch to SSN
            const dropdown = screen.getByRole('combobox');
            await user.click(dropdown);
            const ssnOption = await screen.findByText('SSN');
            await user.click(ssnOption);

            // Wait for the SSN input to appear, then submit empty
            await screen.findByPlaceholderText('###-##-####');
            await user.click(screen.getByTestId('search-btn'));

            expect(
                await screen.findByText(
                    /enter a social security number to return search results/i
                )
            ).toBeInTheDocument();
        });
    });

    // ─── Owner search ────────────────────────────────────────────────────────
    describe('Owner search', () => {
        test('switching to Owner and searching sends firstName and lastName to the API', async () => {
            const user = userEvent.setup();
            const { handler, calls } = createSpyPolicySearchHandler();

            renderPolicyIndexPage(undefined, [handler]);

            await screen.findByText(mockPolicySearchResults[0].productName);

            // Open the "Search by" dropdown and select "Owner"
            const dropdown = screen.getByRole('combobox');
            await user.click(dropdown);
            const ownerOption = await screen.findByText('Owner');
            await user.click(ownerOption);

            // The Owner toggle renders two inputs (first name and last name)
            const firstNameInput = await screen.findByPlaceholderText(
                "Individual's first name"
            );
            const lastNameInput = screen.getByPlaceholderText(
                "Individual's last name"
            );

            await user.type(firstNameInput, 'John');
            await user.type(lastNameInput, 'Doe');
            await user.click(screen.getByTestId('search-btn'));

            const lastCall = calls.at(-1);
            expect(lastCall).toBeDefined();
            expect(lastCall!.body).toMatchObject({
                firstName: 'John',
                lastName: 'Doe',
            });
        });

        test('submitting an empty Owner search shows name error messages', async () => {
            const user = userEvent.setup();

            renderPolicyIndexPage();

            await screen.findByText(mockPolicySearchResults[0].productName);

            // Switch to Owner
            const dropdown = screen.getByRole('combobox');
            await user.click(dropdown);
            const ownerOption = await screen.findByText('Owner');
            await user.click(ownerOption);

            // Wait for the name fields to appear, then submit empty
            await screen.findByPlaceholderText("Individual's first name");
            await user.click(screen.getByTestId('search-btn'));

            expect(
                await screen.findByText(
                    /enter a first name to return search results/i
                )
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    /enter a last name to return search results/i
                )
            ).toBeInTheDocument();
        });
    });

    // ─── Sort functionality ──────────────────────────────────────────────────
    describe('sort functionality', () => {
        test('clicking "Last Updated" header toggles sort order from desc to asc', async () => {
            const user = userEvent.setup();
            const { handler, calls } = createSpyPolicySearchHandler();

            renderPolicyIndexPage(undefined, [handler]);

            await screen.findByText(mockPolicySearchResults[0].productName);

            // The initial sort is lastUpdated DESC (the default).
            // Find the sortable header button inside the "Last Updated" column.
            const lastUpdatedHeader = screen.getByRole('button', {
                name: /last updated/i,
            });

            // Click once → should toggle to ASC (same column, so order flips)
            await user.click(lastUpdatedHeader);

            // Wait for the re-fetch after sort change
            await screen.findByText(mockPolicySearchResults[0].productName);

            // The most recent call should have sortOrder=asc
            const ascCall = calls.at(-1);
            expect(ascCall).toBeDefined();
            expect(ascCall!.searchParams.get('sortOrder')).toBe('asc');
            expect(ascCall!.searchParams.get('sortBy')).toBe('lastUpdated');
        });

        test('clicking "Last Updated" header twice returns to desc', async () => {
            const user = userEvent.setup();
            const { handler, calls } = createSpyPolicySearchHandler();

            renderPolicyIndexPage(undefined, [handler]);

            await screen.findByText(mockPolicySearchResults[0].productName);

            const lastUpdatedHeader = screen.getByRole('button', {
                name: /last updated/i,
            });

            // Click once (desc → asc), click again (asc → desc)
            await user.click(lastUpdatedHeader);
            await screen.findByText(mockPolicySearchResults[0].productName);
            await user.click(lastUpdatedHeader);
            await screen.findByText(mockPolicySearchResults[0].productName);

            const descCall = calls.at(-1);
            expect(descCall).toBeDefined();
            expect(descCall!.searchParams.get('sortOrder')).toBe('desc');
            expect(descCall!.searchParams.get('sortBy')).toBe('lastUpdated');
        });
    });


  
});
