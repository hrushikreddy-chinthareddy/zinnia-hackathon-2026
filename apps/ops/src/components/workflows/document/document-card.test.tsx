import { render, screen } from '@testing-library/react';

import DocumentCard from './document-card';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: jest.fn((key: any, value: any) => `${key}: ${value.documentId}`),
    }),
}));

jest.mock(
    '@deps/components/dynamic-form/customization/templates/card-templates/card-template',
    () => ({
        DocumentActions: () => <div>Document Actions</div>,
    })
);

const documentCardProps = {
    document: {
        documentId: '123123',
        displayName: 'Document 1',
        carrier: 'FLIC',
    },
};

describe('##DocumentCard', () => {
    it('#should render DocumentCard with document details correctly', () => {
        render(<DocumentCard {...documentCardProps} />);

        expect(screen.getByText('Document 1')).toBeInTheDocument();
        expect(
            screen.getByText('caseOverview.sidesheet.documentId: 123123')
        ).toBeInTheDocument();
        expect(screen.getByText('Document Actions')).toBeInTheDocument();
    });
});
