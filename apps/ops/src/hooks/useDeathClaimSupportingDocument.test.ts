import { renderHook, act, waitFor } from '@testing-library/react';

import { getDocuments } from '@deps/queries/api/integration';

import {
    useDeathClaimSupportingDocument,
    QueueNames,
} from './useDeathClaimSupportingDocument';

jest.mock('@deps/queries/api/integration', () => ({
    getDocuments: jest.fn(),
}));

describe('useDeathClaimSupportingDocument', () => {
    const mockGetDocuments = getDocuments as jest.Mock;

    const allDocs = [
        { id: 1, queueName: QueueNames.CPNEW },
        { id: 2, queueName: QueueNames.CPASSIGNED },
        { id: 3, queueName: 'UNMATCHED' },
        { id: 4, queueName: QueueNames.CPRETURNING },
        { id: 5, queueName: QueueNames.CASECREATION },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('filters only documents with applicable queue names', async () => {
        mockGetDocuments.mockResolvedValue(allDocs);

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('LIFE', 'POL123')
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.supportingDocuments).toEqual([
            { id: 1, queueName: QueueNames.CPNEW },
            { id: 2, queueName: QueueNames.CPASSIGNED },
            { id: 4, queueName: QueueNames.CPRETURNING },
            { id: 5, queueName: QueueNames.CASECREATION },
        ]);
    });

    it('excludes documents not in applicableQueueNames', async () => {
        mockGetDocuments.mockResolvedValue([
            { id: 99, queueName: 'UNRELATED' },
        ]);

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('LIFE', 'POL999')
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.supportingDocuments).toEqual([]);
    });

    it('handles undefined response gracefully', async () => {
        mockGetDocuments.mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('LIFE', 'POL321')
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.supportingDocuments).toEqual([]);
    });

    it('sets loading state correctly during fetch', async () => {
        let resolveFn: (value: unknown) => void;
        const promise = new Promise((resolve) => {
            resolveFn = resolve;
        });

        mockGetDocuments.mockReturnValue(promise);

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('LIFE', 'POLLOADING')
        );

        expect(result.current.isLoading).toBe(true);

        act(() => {
            resolveFn([]);
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('resets documents and handles API error', async () => {
        mockGetDocuments.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('ERROR_LOB', 'ERR123')
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.supportingDocuments).toEqual([]);
    });

    it('refetches when lob or policyNumber changes', async () => {
        mockGetDocuments
            .mockResolvedValueOnce([{ id: 1, queueName: QueueNames.CPNEW }])
            .mockResolvedValueOnce([
                { id: 2, queueName: QueueNames.CPASSIGNED },
            ]);

        const { result, rerender } = renderHook(
            ({ lob, policy }) => useDeathClaimSupportingDocument(lob, policy),
            {
                initialProps: { lob: 'LIFE', policy: 'POL1' },
            }
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.supportingDocuments).toEqual([
            { id: 1, queueName: QueueNames.CPNEW },
        ]);

        rerender({ lob: 'LIFE', policy: 'POL2' });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.supportingDocuments).toEqual([
            { id: 2, queueName: QueueNames.CPASSIGNED },
        ]);
    });

    it('returns default state before fetch resolves', async () => {
        let resolveFn: (value: unknown) => void;
        const promise = new Promise((resolve) => {
            resolveFn = resolve;
        });
        mockGetDocuments.mockReturnValue(promise);

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('LIFE', 'INIT123')
        );

        expect(result.current).toEqual({
            supportingDocuments: [],
            isLoading: true,
        });

        act(() => {
            resolveFn([]);
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('returns expected shape after successful fetch', async () => {
        const docs = [{ id: 10, queueName: QueueNames.CPNEW }];
        mockGetDocuments.mockResolvedValue(docs);

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('LIFE', 'POL789')
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current).toEqual({
            supportingDocuments: docs,
            isLoading: false,
        });
    });

    it('returns expected shape after API error', async () => {
        mockGetDocuments.mockRejectedValue(new Error('API failure'));

        const { result } = renderHook(() =>
            useDeathClaimSupportingDocument('LIFE', 'FAIL789')
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current).toEqual({
            supportingDocuments: [],
            isLoading: false,
        });
    });
});
