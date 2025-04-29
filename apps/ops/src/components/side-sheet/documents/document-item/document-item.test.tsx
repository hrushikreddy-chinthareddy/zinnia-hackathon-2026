import { render, screen } from '@testing-library/react';

import SideSheetDocumentItem from './document-item';
import { mockDocuments } from './document-item.stories';
import { DocumentTypeView } from '../DocumentTypeView';

const unsupportedDocument = mockDocuments[mockDocuments.length - 1];
const supportedDocument = mockDocuments[0];

jest.mock('@deps/utils/server-logging');
jest.mock('@deps/hooks/useDocumentDownload', () => ({
    useDocumentDownload: jest.fn(() => [false, jest.fn()]),
    isPreviewSupported: jest.requireActual('@deps/hooks/useDocumentDownload').isPreviewSupported,
}));

describe('SideSheetDocumentItem', () => {
    it('renders text for unsupported document types', () => {
        const testDate = new Date();
        testDate.setMonth(testDate.getMonth() - 10);
        unsupportedDocument.documentDate = testDate.toISOString();
        const { container } = render(<SideSheetDocumentItem document={unsupportedDocument} activeDocType={DocumentTypeView.Policy} />);
        expect(container.querySelectorAll('a')).toHaveLength(0);
        expect(screen.getByText('Unsupported Document')).toBeInTheDocument();
        expect(screen.getByText('sideSheet.posted 10 months ago')).toBeInTheDocument();
    });

    it('renders text for supported document types', () => {
        const testDate = new Date();
        testDate.setMonth(testDate.getMonth() - 10);
        supportedDocument.documentDate = testDate.toISOString();
        const { container } = render(<SideSheetDocumentItem document={supportedDocument} activeDocType={DocumentTypeView.Policy} />);
        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(screen.getByText('Document PDF')).toBeInTheDocument();
        expect(screen.getByText('sideSheet.posted 10 months ago')).toBeInTheDocument();
    });
});
