import { http, HttpResponse } from 'msw';

import { PolicyReferenceSearchResponse } from '@deps/types/search';

import { mockPolicySearchResults } from './policy-index-test-fixtures';

const defaultSearchResponse: PolicyReferenceSearchResponse = {
    count: mockPolicySearchResults.length,
    next: '',
    previous: '',
    results: mockPolicySearchResults,
    total: mockPolicySearchResults.length,
};

/**
 * Default policy search handler — returns a page of mock results.
 * Override `data` to customise the response for a specific test.
 */
export const policySearchHandler = (
    data: PolicyReferenceSearchResponse = defaultSearchResponse
) =>
    http.post('*/api/policies/search', () => {
        return HttpResponse.json(data);
    });

/**
 * A policy-search handler that records every request so tests can inspect
 * the query-string parameters and POST body that were sent.
 *
 * Usage:
 * ```ts
 * const { handler, calls } = createSpyPolicySearchHandler();
 * renderPolicyIndexPage(undefined, [handler]);
 * // … interact with the UI …
 * expect(calls.at(-1)?.searchParams.get('sortOrder')).toBe('asc');
 * ```
 */
export interface SearchCall {
    searchParams: URLSearchParams;
    body: Record<string, unknown>;
}

export const createSpyPolicySearchHandler = (
    data: PolicyReferenceSearchResponse = defaultSearchResponse
) => {
    const calls: SearchCall[] = [];

    const handler = http.post(
        '*/api/policies/search',
        async ({ request }) => {
            const url = new URL(request.url);
            const body = (await request.json()) as Record<string, unknown>;
            calls.push({ searchParams: url.searchParams, body });
            return HttpResponse.json(data);
        }
    );

    return { handler, calls };
};

/**
 * Returns an empty search response (no results).
 */
export const emptyPolicySearchHandler = policySearchHandler({
    count: 0,
    next: '',
    previous: '',
    results: [],
    total: 0,
});

/**
 * Simulates a network error for the policy search endpoint.
 */
export const errorPolicySearchHandler = http.post(
    '*/api/policies/search',
    () => {
        return HttpResponse.error();
    }
);
