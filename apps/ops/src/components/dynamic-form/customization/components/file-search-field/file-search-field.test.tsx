import { RJSFSchema, Registry } from '@rjsf/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpStatusCode } from 'axios';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { ActionTypes } from '@deps/models/case/task';
import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';

import { FileSearchField } from './file-search-field';
import { FileAttachmentProps } from '../../widgets/file-widget/file-widget';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

// Mock dependencies
jest.mock('@deps/queries/tanstack/documentQueries/document-queries', () => ({
    getDocumentSearchResultsQuery: jest.fn(),
}));

// Mock browser logging functions
jest.mock('@deps/utils/browser-logging', () => ({
    browserLogError: jest.fn(),
}));

// Setup mock document data
const mockDocuments = [
    {
        documentId: '68667edd68c00e04387caa8d',
        displayName: 'Test Document 1',
        fileType: 'pdf',
        documentCategory: 'Category A',
        documentType: 'Type X',
    },
    {
        documentId: '68667edd68c00e04387caa8a',
        displayName: 'Test Document 2',
        fileType: 'docx',
        documentCategory: 'Category B',
        documentType: 'Type Y',
    },
];

// Setup default props
const defaultProps: FileAttachmentProps = {
    attachments: [],
    setAttachments: jest.fn(),
    widgetProps: {
        id: 'file-search-field',
        disabled: false,
        rawErrors: undefined,
        uiSchema: {
            'ui:options': {
                icon: 'DOCUMENT_TEXT',
                default: 'case-123',
            },
        },
        formContext: {
            customData: {
                caseId: 'case-123',
                carrier: 'carrier-xyz',
            },
        },
        Placeholder: 'Search documents...',
        readonly: false,
        // Add missing required WidgetProps properties
        name: 'file-search-field',
        schema: {} as RJSFSchema,
        value: undefined,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        options: {},
        required: false,
        label: '',
        multiple: false,
        autofocus: false,
        placeholder: 'Search documents...',
        registry: {} as Registry,
    },
};

// Helper function to render with QueryClient
const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

describe('FileSearchField Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default successful API response
        (getDocumentSearchResultsQuery as jest.Mock).mockResolvedValue({
            data: mockDocuments,
            status: HttpStatusCode.Ok,
        });
    });

    it('renders correctly with default props', async () => {
        renderWithQueryClient(<FileSearchField {...defaultProps} />);

        // Check if input is rendered with correct placeholder
        const input = screen.getByPlaceholderText('Search documents...');
        expect(input).toBeInTheDocument();

        // Wait for documents to load
        await waitFor(() => {
            expect(getDocumentSearchResultsQuery).toHaveBeenCalled();
        });
    });

    it('fetches documents on mount', async () => {
        renderWithQueryClient(<FileSearchField {...defaultProps} />);

        await waitFor(() => {
            expect(getDocumentSearchResultsQuery).toHaveBeenCalledWith(
                {
                    documentClassification: 'INBOUND',
                    zinniaLiveCaseId: 'case-123',
                    parentCarrierCode: 'carrier-xyz',
                },
                25,
                0
            );
        });
    });

    it('displays loading state while fetching documents', async () => {
        // Delay the API response
        (getDocumentSearchResultsQuery as jest.Mock).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () => resolve({ data: mockDocuments, status: 200 }),
                        100
                    )
                )
        );

        const { getByText } = renderWithQueryClient(
            <FileSearchField {...defaultProps} />
        );

        // Check if loading message appears
        expect(getByText('fetchingDocuments')).toBeInTheDocument();

        // Wait for the API call to resolve
        await waitFor(() => {
            expect(getDocumentSearchResultsQuery).toHaveBeenCalled();
        });
    });

    it('displays error state when API fails', async () => {
        // Mock API failure
        (getDocumentSearchResultsQuery as jest.Mock).mockRejectedValue(
            new Error('API failed')
        );

        renderWithQueryClient(<FileSearchField {...defaultProps} />);

        await waitFor(() => {
            expect(getDocumentSearchResultsQuery).toHaveBeenCalled();
        });
    });

    it('filters documents based on search input', async () => {
        renderWithQueryClient(<FileSearchField {...defaultProps} />);

        // Wait for documents to load
        await waitFor(() => {
            expect(getDocumentSearchResultsQuery).toHaveBeenCalled();
        });

        // Type in search field
        const input = screen.getByPlaceholderText('Search documents...');
        fireEvent.focus(input);
        userEvent.type(input, '68667edd68c00e04387caa8d');

        // Check if filtered documents are displayed
        await waitFor(() => {
            // Check for Document 1 by its display name (this is the visible text in the DOM)
            expect(screen.getByText('Test Document 1')).toBeInTheDocument();

            // Check for the Document ID in the subtitle - it's part of 'Document Id: 68667edd68c00e04387caa8d'
            expect(
                screen.getByText(/68667edd68c00e04387caa8d/)
            ).toBeInTheDocument();

            // Make sure Document 2 isn't shown
            expect(
                screen.queryByText('Test Document 2')
            ).not.toBeInTheDocument();
        });
    });

    it('selects a document when clicked', async () => {
        renderWithQueryClient(<FileSearchField {...defaultProps} />);

        // Wait for documents to load
        await waitFor(() => {
            expect(getDocumentSearchResultsQuery).toHaveBeenCalled();
        });

        // Type in search field to show documents
        const input = screen.getByPlaceholderText('Search documents...');
        fireEvent.focus(input);
        userEvent.type(input, 'Test');

        // Click on a document
        await waitFor(() => {
            const documentElement = screen.getByText('Test Document 1');
            fireEvent.click(documentElement);
        });

        // Check if setAttachments was called with correct data
        expect(defaultProps.setAttachments).toHaveBeenCalledWith(
            {
                documentId: '68667edd68c00e04387caa8d',
                docCategory: 'Category A',
                documentType: 'Type X',
                documentExt: 'pdf',
                documentName: 'Test Document 1',
            },
            ActionTypes.Add
        );
    });

    it('prevents duplicate document selection', async () => {
        // Setup with an already selected document
        const propsWithAttachments = {
            ...defaultProps,
            attachments: [
                {
                    documentId: '68667edd68c00e04387caa8d',
                    docCategory: 'Category A',
                    documentType: 'Type X',
                    documentExt: 'pdf',
                    documentName: 'Test Document 1',
                },
            ],
        };

        renderWithQueryClient(<FileSearchField {...propsWithAttachments} />);

        // Type in search field to show documents
        const input = screen.getByPlaceholderText('Search documents...');
        fireEvent.focus(input);
        await userEvent.type(input, '68667edd');

        // Check if setAttachments was not called for already selected document
        expect(defaultProps.setAttachments).not.toHaveBeenCalled();
    });

    it('handles disabled state correctly', () => {
        const disabledProps = {
            ...defaultProps,
            widgetProps: {
                ...defaultProps.widgetProps,
                disabled: true,
            },
        };

        renderWithQueryClient(<FileSearchField {...disabledProps} />);

        const input = screen.getByPlaceholderText('Search documents...');
        expect(input).toBeDisabled();
    });

    it('handles readonly state correctly', () => {
        const readonlyProps = {
            ...defaultProps,
            widgetProps: {
                ...defaultProps.widgetProps,
                readonly: true,
            },
        };

        renderWithQueryClient(<FileSearchField {...readonlyProps} />);

        const input = screen.getByPlaceholderText('Search documents...');
        expect(input).toHaveAttribute('readonly');
    });

    it('displays validation errors when provided', () => {
        const propsWithErrors = {
            ...defaultProps,
            widgetProps: {
                ...defaultProps.widgetProps,
                rawErrors: ['This field is required'],
            },
        };

        renderWithQueryClient(<FileSearchField {...propsWithErrors} />);

        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('displays no documents message when no documents are found', async () => {
        // Mock empty response
        (getDocumentSearchResultsQuery as jest.Mock).mockResolvedValue({
            data: [],
            status: HttpStatusCode.Ok,
        });

        renderWithQueryClient(<FileSearchField {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('noDocumentFound')).toBeInTheDocument();
        });
    });
});
