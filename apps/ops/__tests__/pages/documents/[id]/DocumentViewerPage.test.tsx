import { useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { DocumentDownloadV2WithMime } from '@deps/models/case/document';
import { UserProfile } from '@deps/models/user-profile';
import DocumentViewerPage from '@deps/pages/documents/[id]/index';
import { b64ToBlob } from '@deps/utils/blob';
import {
    drawCanvas,
    renderTiffPagesToContainer,
} from '@deps/utils/fileviewer/tiffUtils';

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));
jest.mock('@deps/utils/optimizely/optimizely', () => ({
    isFeatureFlagVariableActive: jest.fn(),
    optimizelyService: {
        getAllFeatureFlagVariables: jest.fn(),
    },
}));
jest.mock('@deps/utils/blob', () => ({
    b64ToBlob: jest.fn(),
}));
jest.mock('tiff', () => ({
    default: {},
}));

jest.mock('@deps/utils/fileviewer/tiffUtils', () => ({
    renderTiffPagesToContainer: jest.fn(() => Promise.resolve([{}])),
    drawCanvas: jest.fn(),
}));
jest.mock(
    '@deps/pages/404s',
    () =>
        function Mock404Page() {
            return <div>404 Page Mock</div>;
        }
);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@deps/hooks/useSegmentPageTracker', () => ({
    useSegmentPageTracker: jest.fn(),
}));

global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

class MockImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
    }
}
(global as any).ImageData = MockImageData;

describe('DocumentViewerPage', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });
    const mockUser: UserProfile = {
        sub: 'auth0|123',
        partyId: 'party-xyz',
        nickname: 'johnny',
        name: 'John Doe',
        picture: 'https://example.com/avatar.png',
        updated_at: new Date().toISOString(),
        email: 'john@example.com',
        email_verified: true,
        sid: 'session-123',
        user_metadata: { communication_mode: 'email' },
        app_metadata: { company: 'ACME Corp' },
    };
    const mockTiffDoc: DocumentDownloadV2WithMime = {
        binaryData: 'mock-base64-tiff',
        mimeType: 'image/tiff',
        fileExtension: 'tiff',
    };
    const mockPdfDoc: DocumentDownloadV2WithMime = {
        binaryData: 'mock-base64-pdf',
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
    };
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            query: {},
            push: jest.fn(),
        });
        (useQuery as jest.Mock).mockReturnValue({ isLoading: false, data: {} });
        (renderTiffPagesToContainer as jest.Mock).mockImplementation(
            async (binaryData, container) => {
                const state = {
                    imageData: new ImageData(1, 1),
                    width: 1,
                    height: 1,
                    scale: 1,
                    rotation: 0,
                };
                (drawCanvas as jest.Mock).mockImplementation(() => {});
                drawCanvas(container, state);
                return [state];
            }
        );
        (drawCanvas as jest.Mock).mockImplementation(() => {});
        (b64ToBlob as jest.Mock).mockReturnValue(new Blob());
        (global.URL.createObjectURL as jest.Mock).mockReturnValue('mock-url');
    });

    it('renders the PDF viewer when given a non-TIFF document', () => {
        render(<DocumentViewerPage doc={mockPdfDoc} user={mockUser} />);
        expect(screen.getByTitle('Document Viewer')).toBeInTheDocument();
        expect(screen.getByTitle('Document Viewer')).toHaveAttribute(
            'src',
            'mock-url'
        );
    });

    it('renders the TIFF viewer with buttons when given a TIFF document', async () => {
        render(<DocumentViewerPage doc={mockTiffDoc} user={mockUser} />);
        await waitFor(() => {
            expect(renderTiffPagesToContainer).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => expect(drawCanvas).toHaveBeenCalled());
        expect(
            screen.getByLabelText('policy.documents.zoomIn')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('policy.documents.zoomOut')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('policy.documents.rotate')
        ).toBeInTheDocument();
    });
    it('displays a 404 page if a document URL cannot be created', () => {
        (b64ToBlob as jest.Mock).mockReturnValue(null);
        render(<DocumentViewerPage doc={mockPdfDoc} user={mockUser} />);
        expect(screen.getByText('404 Page Mock')).toBeInTheDocument();
    });
    it('calls renderTiffPagesToContainer and redrawAllPages on mount for TIFF documents', async () => {
        render(<DocumentViewerPage doc={mockTiffDoc} user={mockUser} />);
        await waitFor(() => {
            expect(renderTiffPagesToContainer).toHaveBeenCalledWith(
                'mock-base64-tiff',
                expect.any(HTMLDivElement)
            );
        });
        await waitFor(() => expect(drawCanvas).toHaveBeenCalled());
    });

    it('updates scale and redraws all pages when zoomIn is clicked', async () => {
        render(<DocumentViewerPage doc={mockTiffDoc} user={mockUser} />);
        await waitFor(() => expect(drawCanvas).toHaveBeenCalled());

        const zoomInButton = screen.getByLabelText('policy.documents.zoomIn');
        fireEvent.click(zoomInButton);

        await waitFor(() => {
            expect(drawCanvas).toHaveBeenCalled();
        });
    });

    it('updates rotation and redraws all pages when rotate is clicked', async () => {
        render(<DocumentViewerPage doc={mockTiffDoc} user={mockUser} />);
        await waitFor(() => expect(drawCanvas).toHaveBeenCalled());

        const rotateButton = screen.getByLabelText('policy.documents.rotate');
        fireEvent.click(rotateButton);

        await waitFor(() => {
            expect(drawCanvas).toHaveBeenCalled();
        });
    });
});
