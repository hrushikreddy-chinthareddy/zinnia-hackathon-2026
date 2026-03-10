import { http, HttpResponse } from 'msw';

import { PolicyReferenceSearchResponse } from '@deps/types/search';

import { mockPolicySearchResults } from './policy-index-test-fixtures';

/**
 * Default policy search handler — returns a page of mock results.
 * Override `data` to customise the response for a specific test.
 */
export const policySearchHandler = (
    data: PolicyReferenceSearchResponse = {
        count: mockPolicySearchResults.length,
        next: null,
        previous: null,
        results: mockPolicySearchResults,
        total: mockPolicySearchResults.length,
    }
) =>
    http.post('*/api/policies/search', () => {
        return HttpResponse.json(data);
    });

/**
 * Returns an empty search response (no results).
 */
export const emptyPolicySearchHandler = policySearchHandler({
    count: 0,
    next: null,
    previous: null,
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
