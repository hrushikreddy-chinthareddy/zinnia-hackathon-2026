import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import {
    DocumentView,
    TransformedStage,
    TransformedStep,
} from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import {
    CaseAdditionalStepData,
    GroupedExceptions,
} from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import { Statuses } from '@deps/models/case/case';

import DocumentsTab from './documents-tab';
import { DocumentTypeView } from '../../documents/DocumentTypeView';

function createMockStep(overrides = {}): TransformedStep {
    return Object.assign(
        {
            documents: [],
            id: 'step-1',
            name: 'Test Step',
            additionalData: {},
            stepAdditionalData: [] as CaseAdditionalStepData[],
            exceptions: [],
            exceptionsGroupedByTask: {} as GroupedExceptions,
            isMultiInstance: false,
            parentStage: {} as TransformedStage,
            status: Statuses.InProgress,
            stepRaw: {
                id: 'requestAcknowledgement.newWithdrawalRequestReceived',
                label: 'Receive redemption request',
                stepStatus: Statuses.InProgress,
                stepResult: '',
                eventRef: [],
                updatedAt: '2025-07-03T13:36:56.000Z',
                tasks: null,
                mappedTasks: [],
                mappedExceptions: [],
                mappedDocuments: ['24555821'],
                mappedNotes: [],
                additionalData: {},
                stepAdditionalData: [],
                multiInstance: false,
                instanceInfo: null,
                createdAt: '2025-07-03T13:27:04.000Z',
            },
            tasks: [],
            updatedAt: '2025-07-03T13:36:56.000Z',
            description: undefined,
            stepResult: '',
        },
        overrides
    ) as unknown as TransformedStep;
}

// Mock the translation hook
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
            if (key === 'caseOverview.sidesheet.documents') {
                return 'Documents';
            }
            if (key === 'caseOverview.sidesheet.documentId') {
                return `Document ID: ${options?.documentId}`;
            }
            return key;
        },
    }),
}));

// Mock the createViewDownloadAction function
jest.mock(
    '@deps/containers/subpages/documents-sub-page/documents-results-table',
    () => ({
        createViewDownloadAction: jest.fn((document: DocumentView) => {
            if (document.fileType === 'pdf') {
                return <button data-testid="view-document-button">View</button>;
            }
            return (
                <button data-testid="download-document-button">Download</button>
            );
        }),
    })
);

describe('DocumentsTab', () => {
    const mockDocument: DocumentView = {
        id: 'doc-123',
        name: 'Test Document',
        fileType: 'pdf',
        previewDocProps: {
            activeDocType: DocumentTypeView.Case,
            carrier: 'test',
            documentId: 'doc-123',
        },
        source: 'test',
        url: 'test',
        updatedAt: 'test',
        additionalData: {},
        eventRef: [],
    };

    // Create a mock step with the test document
    const mockStep = createMockStep({
        documents: [mockDocument],
        stepRaw: {
            id: 'requestAcknowledgement.newWithdrawalRequestReceived',
            label: 'Receive redemption request',
            stepStatus: Statuses.InProgress,
            stepResult: '',
            eventRef: [
                'b575b9ab-3834-44ae-9a20-439279cd7165',
                'a5560465-1900-422b-8240-79269ae886b6',
            ],
            updatedAt: '2025-07-03T13:36:56.000Z',
            tasks: null,
            mappedTasks: [],
            mappedExceptions: [],
            mappedDocuments: ['24555821'],
            mappedNotes: [],
            additionalData: {},
            stepAdditionalData: [],
            multiInstance: false,
            instanceInfo: null,
            createdAt: '2025-07-03T13:27:04.000Z',
        },
    });

    it('renders the documents tab with title', () => {
        render(<DocumentsTab step={mockStep} />);

        expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('renders documents when provided in step', () => {
        render(<DocumentsTab step={mockStep} />);

        expect(screen.getByText('Test Document')).toBeInTheDocument();
        expect(screen.getByText('Document ID: doc-123')).toBeInTheDocument();
    });

    it('does not render null documents', () => {
        const stepWithNullDoc = createMockStep({
            documents: [mockDocument, null],
        });

        render(<DocumentsTab step={stepWithNullDoc} />);

        // Should still only render one document
        expect(screen.getAllByTestId('view-document-button')).toHaveLength(1);
    });

    it('renders empty list when no documents', () => {
        const stepWithNoDocuments = createMockStep({
            documents: [],
        });

        render(<DocumentsTab step={stepWithNoDocuments} />);

        expect(screen.queryByText('Test Document')).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('view-document-button')
        ).not.toBeInTheDocument();
    });

    it('renders document with view action button', () => {
        render(<DocumentsTab step={mockStep} />);

        expect(screen.getByTestId('view-document-button')).toBeInTheDocument();
    });

    it('renders document with download action button', () => {
        // Create a proper TransformedStep instance with the modified document
        const stepWithDownloadDoc = createMockStep({
            documents: [{ ...mockDocument, fileType: 'docx' }],
        });

        render(<DocumentsTab step={stepWithDownloadDoc} />);

        expect(
            screen.getByTestId('download-document-button')
        ).toBeInTheDocument();
    });
});
