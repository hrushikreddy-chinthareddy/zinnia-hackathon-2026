import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Button from '@deps/components/button/button';
import '@deps/styles/styles.css';

import SideSheetDocumentItem from './document-item';
import SideSheet from '../../side-sheet';
import { DocumentTypeView } from '../DocumentTypeView';
import { mockDocuments } from './document-item.test';

export default {
    title: 'Components/SideSheet',
    component: SideSheetDocumentItem,
    decorators: [
        (Story) => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SideSheetDocumentItem>;

export const DocumentItems = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(true);
    const handleClose = () => setOpen(false);

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={() => setOpen(true)}>Open SideSheet</Button>
            </div>
            <SideSheet
                open={open}
                handleClose={handleClose}
                header={
                    t('sideSheet.documents', {
                        count: mockDocuments.length,
                    }) as string
                }
            >
                {mockDocuments.map((document) => (
                    <SideSheetDocumentItem
                        key={document.documentID}
                        document={document}
                        activeDocType={DocumentTypeView.Correspondence}
                    />
                ))}
            </SideSheet>
        </div>
    );
};
