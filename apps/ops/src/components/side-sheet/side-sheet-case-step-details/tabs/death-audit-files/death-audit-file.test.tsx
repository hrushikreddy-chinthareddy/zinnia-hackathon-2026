import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';

import DeathAuditFile from './death-audit-file';
import { AuditFile } from './death-audit-files.types';

// Mocks
const mockDocumentCard = jest.fn((_props: any) => (
    <div data-testid="document-card" />
));

jest.mock('@deps/components/workflows/document/document-card', () => ({
    __esModule: true,
    default: (props: any) => mockDocumentCard(props),
}));

jest.mock('@deps/components/side-sheet/documents/DocumentTypeView', () => ({
    DocumentTypeView: { Correspondence: 'Correspondence' },
}));

describe('##DeathAuditFile', () => {
    beforeEach(() => {
        mockDocumentCard.mockClear();
    });

    const baseFile = (
        overrides: Partial<{ documentId: string; fileName: string }>
    ) => ({
        documentId: 'doc-123',
        fileName: 'statement.pdf',
        ...overrides,
    });

    it('#renders the list item container', () => {
        render(
            <DeathAuditFile
                file={baseFile({}) as AuditFile}
                carrier="CarrierA"
            />
        );

        // The component root is an <li>
        const listItem = screen.getByRole('listitem');
        expect(listItem).toBeInTheDocument();
        expect(listItem).toHaveClass('mt-1');
    });

    it('#passes correct props to DocumentCard for non-EML/CSV files', () => {
        const file = baseFile({
            fileName: 'statement.pdf',
            documentId: 'doc-123',
        });

        render(<DeathAuditFile file={file as AuditFile} carrier="CarrierA" />);

        expect(mockDocumentCard).toHaveBeenCalledTimes(1);
        expect(mockDocumentCard).toHaveBeenCalledWith(
            expect.objectContaining({
                cardClass: 'mt-2 mb-4',
                document: {
                    documentId: 'doc-123',
                    displayName: 'statement',
                    docTypeView: DocumentTypeView.Correspondence,
                    carrier: 'CarrierA',
                },
                isViewButtonHidden: false,
            })
        );
    });

    it('#hides view button for EML files and strips extension from display name', () => {
        const file = baseFile({ fileName: 'MAIL.EML', documentId: 'doc-999' });

        render(<DeathAuditFile file={file as AuditFile} carrier="CarrierB" />);

        expect(mockDocumentCard).toHaveBeenCalledTimes(1);
        expect(mockDocumentCard).toHaveBeenCalledWith(
            expect.objectContaining({
                document: {
                    documentId: 'doc-999',
                    displayName: 'MAIL',
                    docTypeView: DocumentTypeView.Correspondence,
                    carrier: 'CarrierB',
                },
                isViewButtonHidden: true,
            })
        );
    });

    it('#hides view button for CSV files', () => {
        const file = baseFile({
            fileName: 'records.csv',
            documentId: 'doc-321',
        });

        render(<DeathAuditFile file={file as AuditFile} carrier="CarrierD" />);

        expect(mockDocumentCard).toHaveBeenCalledTimes(1);
        expect(mockDocumentCard).toHaveBeenCalledWith(
            expect.objectContaining({
                document: {
                    documentId: 'doc-321',
                    displayName: 'records',
                    docTypeView: DocumentTypeView.Correspondence,
                    carrier: 'CarrierD',
                },
                isViewButtonHidden: true,
            })
        );
    });

    it('#handles missing values by falling back to empty strings', () => {
        const file = baseFile({
            fileName: undefined as any,
            documentId: undefined as any,
        });

        render(<DeathAuditFile file={file as AuditFile} carrier="CarrierC" />);

        expect(mockDocumentCard).toHaveBeenCalledTimes(1);
        expect(mockDocumentCard).toHaveBeenCalledWith(
            expect.objectContaining({
                document: {
                    documentId: '',
                    displayName: '',
                    docTypeView: DocumentTypeView.Correspondence,
                    carrier: 'CarrierC',
                },
                isViewButtonHidden: false,
            })
        );
    });
});
