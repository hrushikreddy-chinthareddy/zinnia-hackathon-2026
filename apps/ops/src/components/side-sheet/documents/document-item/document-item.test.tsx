import { render, screen } from '@testing-library/react';

import { PolicyDocument } from '@deps/models/case/document';

import SideSheetDocumentItem from './document-item';
import { DocumentTypeView } from '../DocumentTypeView';

export const mockDocuments: PolicyDocument[] = [
    {
        caseId: '000000000123',
        contractNumber: '000000000123',
        displayName: 'Document PDF',
        documentDate: '2023-05-01T10:00:00.000Z',
        documentID: 'doc1',
        docStatus: 'Active',
        documentType: 'Incoming Transfer',
        documentNumber: '20230726-M-621551',
        importDate: '2023-05-01T10:00:00.000Z',
        source: 'ETP',
        fileType: 'pdf',
    },
    {
        caseId: '00000000124',
        contractNumber: '000000000124',
        displayName: 'Document HTML',
        documentDate: '2023-05-01T10:00:00.000Z',
        documentID: 'doc2',
        docStatus: 'Active',
        documentType: 'Incoming Transfer',
        documentNumber: '20230726-M-621551',
        importDate: '2023-05-01T10:00:00.000Z',
        source: 'ETP',
        fileType: 'html',
    },
    {
        caseId: '00000000125',
        contractNumber: '000000000125',
        displayName: 'Document JPEG',
        documentDate: '2023-05-01T10:00:00.000Z',
        documentID: 'doc3',
        docStatus: 'Active',
        documentType: 'Incoming Transfer',
        documentNumber: '20230726-M-621551',
        importDate: '2023-05-01T10:00:00.000Z',
        source: 'ETP',
        fileType: 'jpeg',
    },
    {
        caseId: '00000000125',
        contractNumber: '000000000125',
        displayName: 'Unsupported Document',
        documentDate: '2023-05-01T10:00:00.000Z',
        documentID: 'doc3',
        docStatus: 'Active',
        documentType: 'Incoming Transfer',
        documentNumber: '20230726-M-621551',
        importDate: '2023-05-01T10:00:00.000Z',
        source: 'ETP',
        fileType: 'NADA',
    },
];

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
