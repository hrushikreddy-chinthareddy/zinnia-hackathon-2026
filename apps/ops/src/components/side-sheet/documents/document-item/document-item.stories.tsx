import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Button from '@deps/components/button/button';
import { PolicyDocument } from '@deps/models/case/document';
import '@deps/styles/styles.css';

import SideSheetDocumentItem from './document-item';
import SideSheet from '../../side-sheet';
import { DocumentTypeView } from '../DocumentTypeView';

export default {
    title: 'Components/SideSheet',
    component: SideSheetDocumentItem,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SideSheetDocumentItem>;

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

export const DocumentItems = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(true);
    const handleClose = () => setOpen(false);

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={() => setOpen(true)}>Open SideSheet</Button>
            </div>
            <SideSheet open={open} handleClose={handleClose} header={t('sideSheet.documents', { count: mockDocuments.length }) as string}>
                {mockDocuments.map(document => (
                    <SideSheetDocumentItem key={document.documentID} document={document} activeDocType={DocumentTypeView.Correspondence} />
                ))}
            </SideSheet>
        </div>
    );
};
