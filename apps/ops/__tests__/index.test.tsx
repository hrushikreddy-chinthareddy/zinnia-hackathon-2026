import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// import DocumentViewerPage from '@deps/pages/documents/[id]';
import { getDocumentPreviewV2 } from '@deps/queries/api/client/documents/v2/preview';

const DocumentViewerPage = (props: { status: number; id: string; documentType: string; carrierCode: string }) => (
    <div>Placeholder while skipping tests {props.id}</div>
);

const baseProps = {
    status: 200,
    id: 'sampleId',
    documentType: 'Policy',
    carrierCode: 'sampleCarrier',
};

const documentResults: { documentBinary: string; extension?: string } = {
    documentBinary: 'fakebinary',
    extension: 'pdf',
};

jest.mock('@auth0/nextjs-auth0', () => ({
    withPageAuthRequired: jest.fn(() => 'mocked withPageAuthRequired'),
}));

jest.mock('@deps/queries/api/documents', () => {
    const originalModule = jest.requireActual('@deps/queries/api/documents');

    return {
        __esModule: true,
        ...originalModule,
        getDocumentDownload: jest.fn(() => ({ fileExtension: documentResults.extension, binaryData: documentResults.documentBinary })),
    };
});

describe.skip('Document Preview Page', () => {
    beforeAll(() => {
        jest.spyOn(global.console, 'error').mockImplementation(() => null);
    });

    afterEach(() => {
        jest.spyOn(global.console, 'error').mockClear();
    });

    afterAll(() => jest.clearAllMocks());

    it('initially renders the loader', () => {
        render(<DocumentViewerPage {...baseProps} />);

        expect(screen.getByTestId('test-loader')).toBeInTheDocument();
    });

    describe('for pdfs', () => {
        it('renders message for PDF that could not be loaded', async () => {
            documentResults.extension = 'pdf';

            render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByText('Failed to load PDF file.')).toBeInTheDocument());
        });

        it('matches snapshot', async () => {
            documentResults.extension = 'pdf';

            const result = render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByText('Failed to load PDF file.')).toBeInTheDocument());
            expect(screen.getByText('Failed to load PDF file.').parentElement?.parentElement?.classList.contains('print:hidden')).toBe(
                true
            );
            expect(result).toMatchSnapshot();
        });
    });

    describe('for html', () => {
        it('matches snapshot', async () => {
            documentResults.extension = 'htm';
            documentResults.documentBinary = 'PGh0bWw+Cjxib2R5Pgo8aDE+V2VsY29tZSB0byBaaW5uaWEgTGl2ZSE8L2gxPgo8L2JvZHk+CjwvaHRtbD4=';

            const result = render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByText('Welcome to Zinnia Live!')).toBeInTheDocument());
            expect(screen.getByText('Welcome to Zinnia Live!').parentElement?.classList.contains('print:hidden')).toBe(true);
            expect(result).toMatchSnapshot();
        });
    });

    describe('for images', () => {
        it('prevents saving using context menu', async () => {
            documentResults.extension = 'png';
            documentResults.documentBinary = 'dummy-unencoded-image-data';

            render(<DocumentViewerPage {...baseProps} />);

            await waitFor(() => expect(screen.getByAltText('document image')).toBeInTheDocument());

            expect(screen.getByAltText('document image').parentElement?.classList.contains('print:hidden')).toBe(true);
            fireEvent.contextMenu(screen.getByAltText('document image'));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('cannot save image');
        });

        it('renders png correctly', async () => {
            documentResults.extension = 'png';
            documentResults.documentBinary = 'dummy-unencoded-image-data';

            const result = render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByAltText('document image')).toBeInTheDocument());
            expect(result).toMatchSnapshot();
        });

        it('renders jpg correctly', async () => {
            documentResults.extension = 'jpg';
            documentResults.documentBinary = 'dummy-unencoded-image-data';

            const result = render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByAltText('document image')).toBeInTheDocument());
            expect(result).toMatchSnapshot();
        });

        it('renders jpeg correctly', async () => {
            documentResults.extension = 'jpeg';
            documentResults.documentBinary = 'dummy-unencoded-image-data';

            const result = render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByAltText('document image')).toBeInTheDocument());
            expect(result).toMatchSnapshot();
        });

        it('renders jfif correctly', async () => {
            documentResults.extension = 'jfif';
            documentResults.documentBinary = 'dummy-unencoded-image-data';

            const result = render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByAltText('document image')).toBeInTheDocument());
            expect(result).toMatchSnapshot();
        });
    });

    describe('for unsupported types', () => {
        it('renders message for undefined extension, aka failure to load document', async () => {
            documentResults.extension = undefined;

            render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByText('sideSheet.documentUnsupported')).toBeInTheDocument());
            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalledWith('Error getting Policy document sampleId for sampleCarrier');
            expect(console.error).toHaveBeenCalledWith('Unsupported file extension undefined for sampleCarrier Policy document sampleId');
        });

        it('renders message for unsupported document types', async () => {
            documentResults.extension = 'txt';

            render(<DocumentViewerPage {...baseProps} />);

            expect(getDocumentPreviewV2).toHaveBeenCalled();
            await waitFor(() => expect(screen.getByText('sideSheet.documentUnsupported')).toBeInTheDocument());
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('Unsupported file extension txt for sampleCarrier Policy document sampleId');
        });
    });
});
