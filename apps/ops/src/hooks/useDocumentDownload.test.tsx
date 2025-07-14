import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { saveAs } from 'file-saver';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { getDocumentDownloadQuery } from '@deps/queries/tanstack/documentQueries/document-queries';

import { useDocumentDownload } from './useDocumentDownload';

jest.mock('@deps/queries/tanstack/documentQueries/document-queries', () => ({
    getDocumentDownloadQuery: jest.fn(),
}));

jest.mock('file-saver', () => ({
    saveAs: jest.fn(),
}));

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: () => ({
        featureFlagVariables: {},
    }),
    OptimizelyVariableKey: {
        Clients: 'Clients',
    },
}));

jest.mock('@deps/utils/optimizely/optimizely', () => ({
    isFeatureFlagVariableActive: jest.fn(() => true),
}));

jest.mock('@deps/components/side-sheet/documents/DocumentTypeView', () => ({
    DocumentTypeView: {
        Case: 'CASE',
        CLAIM: 'CLAIM',
    },
}));

describe('useDocumentDownload', () => {
    const mockBlob = new Blob(['test']);
    const mockGetDocumentDownloadQuery = getDocumentDownloadQuery as jest.Mock;
    const mockSaveAs = saveAs as jest.MockedFunction<typeof saveAs>;
    const isFeatureFlagVariableActive =
        require('@deps/utils/optimizely/optimizely')
            .isFeatureFlagVariableActive as jest.Mock;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls saveAs with correct filename on successful download', async () => {
        mockGetDocumentDownloadQuery.mockResolvedValue({
            blob: mockBlob,
            fileExtension: 'pdf',
        });

        const { result } = renderHook(
            () =>
                useDocumentDownload(
                    'doc123',
                    DocumentTypeView.Case,
                    'CARRIERX',
                    'Test Document.pdf',
                    'pdf'
                ),
            { wrapper }
        );

        const [, download] = result.current;

        await act(async () => {
            await download();
        });

        expect(mockSaveAs).toHaveBeenCalledWith(
            mockBlob,
            'TestDocumentpdf.pdf'
        );
    });

    it('does not call saveAs when download fails', async () => {
        mockGetDocumentDownloadQuery.mockRejectedValue(
            new Error('Download error')
        );

        const { result } = renderHook(
            () =>
                useDocumentDownload(
                    'doc123',
                    DocumentTypeView.Case,
                    'CARRIERX',
                    'ErrorDoc.pdf',
                    'pdf'
                ),
            { wrapper }
        );

        const [, download] = result.current;

        await act(async () => {
            await download();
        });

        expect(mockSaveAs).not.toHaveBeenCalled();
    });

    it.each([
        [true, 'uses useV3 = true'],
        [false, 'uses useV3 = false'],
    ])('respects feature flag: %s', async (flagValue, _) => {
        isFeatureFlagVariableActive.mockReturnValue(flagValue);

        mockGetDocumentDownloadQuery.mockResolvedValue({
            blob: mockBlob,
            fileExtension: 'pdf',
        });

        const { result } = renderHook(
            () =>
                useDocumentDownload(
                    'doc123',
                    DocumentTypeView.Case,
                    'CARRIERX',
                    'FlaggedDoc.pdf',
                    'pdf'
                ),
            { wrapper }
        );

        const [, download] = result.current;

        await act(async () => {
            await download();
        });

        expect(mockGetDocumentDownloadQuery).toHaveBeenCalledWith(
            'doc123',
            DocumentTypeView.Case,
            'CARRIERX',
            'pdf',
            flagValue
        );
    });

    it('sanitizes the document name before saving', async () => {
        mockGetDocumentDownloadQuery.mockResolvedValue({
            blob: mockBlob,
            fileExtension: 'pdf',
        });

        const { result } = renderHook(
            () =>
                useDocumentDownload(
                    'doc123',
                    DocumentTypeView.Case,
                    'CARRIERX',
                    'Invoice 2024 (Final).pdf',
                    'pdf'
                ),
            { wrapper }
        );

        const [, download] = result.current;

        await act(async () => {
            await download();
        });

        expect(mockSaveAs).toHaveBeenCalledWith(
            mockBlob,
            'Invoice2024Finalpdf.pdf'
        );
    });

    it('returns isPending as true while downloading and false after', async () => {
        let resolver: (val: any) => void;
        const promise = new Promise((resolve) => {
            resolver = resolve;
        });

        mockGetDocumentDownloadQuery.mockImplementation(() => promise);

        const { result } = renderHook(
            () =>
                useDocumentDownload(
                    'doc123',
                    DocumentTypeView.Case,
                    'CARRIERX',
                    'Test.pdf',
                    'pdf'
                ),
            { wrapper }
        );

        const [, download] = result.current;

        act(() => {
            download();
        });

        await waitFor(() => {
            expect(result.current[0]).toBe(true);
        });

        await act(async () => {
            resolver!({
                blob: mockBlob,
                fileExtension: 'pdf',
            });
        });

        await waitFor(() => {
            expect(result.current[0]).toBe(false);
        });
    });
});
