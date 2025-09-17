import { fireEvent, render, waitFor } from "@testing-library/react";

import { DEFAULT_LOCALE } from "@deps/helpers/routing.helpers";
import { getDocumentsByClientId, searchDocuments } from "@deps/queries/api/knowledge-base";
import { DocumentsDisplayType } from "@deps/types/knowledge-base";

import DocumentsPage from "./documents-page";

const mockDocuments = [
  {
    name: "Document 1",
    webUrl: "https://example.com/doc1.pdf",
    itemId: "item-1",
    driveId: "drive-item-1",
    createdAt: "2017-06-20T10:14:43Z",
    updatedAt: "2025-07-15T20:21:07Z"
  },
  {
    name: "Document 2",
    webUrl: "https://example.com/doc2.pdf",
    itemId: "item-2",
    driveId: "drive-item-2",
    createdAt: "2018-03-15T08:30:00Z",
    updatedAt: "2024-12-01T15:45:30Z"
  }
];
const mockBrowserLogError = jest.fn();

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: DEFAULT_LOCALE,
    },
  }),
}));

jest.mock('@deps/contexts/KnowledgeBaseContext', () => ({
  useKnowledgeBaseContext: () => ({
    selectedClientId: 'client-123',
  }),
}));

jest.mock('@deps/queries/api/knowledge-base', () => ({
  getDocumentsByClientId: jest.fn(),
  searchDocuments: jest.fn(),
}));

jest.mock('@deps/utils/browser-logging', () => {
  return {
    browserLogError: (...args: any[]) => mockBrowserLogError(...args),
  };
});

describe('Documents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  it('displays the correct title based on documents category', () => {
    const { getByText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    expect(getByText('documents.allDocs')).toBeInTheDocument();
    render(<DocumentsPage docs={DocumentsDisplayType.Recent} />);
    expect(getByText('documents.recentlyAdded')).toBeInTheDocument();
    render(<DocumentsPage docs={DocumentsDisplayType.Updated} />);
    expect(getByText('documents.recentlyModified')).toBeInTheDocument();
  });

  it('fetches documents on render', async () => {
    (getDocumentsByClientId as jest.Mock).mockResolvedValue({
      content: mockDocuments,
      last: true
    });
    const { getByText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
      expect(getByText(mockDocuments[0].name)).toBeInTheDocument();
    });

    render(<DocumentsPage docs={DocumentsDisplayType.Updated} />);
    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.Updated,
        undefined,
        undefined
      );
    });
  });

  it('logs error when fails to fetch documents', async () => {
    const testError = new Error('Network failure');
    (getDocumentsByClientId as jest.Mock).mockRejectedValue(testError);
    render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
      expect(mockBrowserLogError).toHaveBeenCalledWith('Error fetching documents::', { error: testError });
    });
  });

  it('shows no documents found when no documents are found', async () => {
    (getDocumentsByClientId as jest.Mock).mockResolvedValue({
      content: []
    });
    const { getByText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
      expect(getByText('documents.noDoc')).toBeInTheDocument();
    });
  });

  it('fetches matching documents on search', async () => {
    (searchDocuments as jest.Mock).mockResolvedValue({
      content: mockDocuments,
      last: true
    });
    const { getByText, getByPlaceholderText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    const searchInput = getByPlaceholderText('documents.search');

    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    await waitFor(() => {
      expect(searchDocuments).toHaveBeenCalledWith(
        'client-123',
        'Document 1',
        0,
        10
      );
      expect(getByText(mockDocuments[0].name)).toBeInTheDocument();
    });
  });

  it('logs error when fails to search documents', async () => {
    const testError = new Error('Network failure');
    (searchDocuments as jest.Mock).mockRejectedValue(testError);

    const { getByPlaceholderText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    const searchInput = getByPlaceholderText('documents.search');
    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    await waitFor(() => {
      expect(searchDocuments).toHaveBeenCalledWith(
        'client-123',
        'Document 1',
        0,
        10
      );
      expect(mockBrowserLogError).toHaveBeenCalledWith('Error searching documents::', { error: testError });
    });
  });

  it('show no documents found when no documents match the search term', async () => {
    (searchDocuments as jest.Mock).mockResolvedValue({
      content: [],
      last: true
    });
    const { getByText, getByPlaceholderText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    const searchInput = getByPlaceholderText('documents.search');

    fireEvent.change(searchInput, { target: { value: 'Document 2' } });

    await waitFor(() => {
      expect(searchDocuments).toHaveBeenCalledWith(
        'client-123',
        'Document 2',
        0,
        10
      );
      expect(getByText('documents.noDoc')).toBeInTheDocument();
    });
  });

  it('displays the initially fetched documents again when search term is cleared', async () => {
    (getDocumentsByClientId as jest.Mock).mockResolvedValue({
      content: mockDocuments,
      last: true
    });
    (searchDocuments as jest.Mock).mockResolvedValue({
      content: [],
      last: true
    });

    const { getByText, getByPlaceholderText, getByRole } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
      expect(getByText(mockDocuments[0].name)).toBeInTheDocument();
    });

    const searchInput = getByPlaceholderText('documents.search');
    fireEvent.change(searchInput, { target: { value: 'Document 2' } });

    await waitFor(() => {
      expect(searchDocuments).toHaveBeenCalledWith(
        'client-123',
        'Document 2',
        0,
        10
      );
      expect(getByText('documents.noDoc')).toBeInTheDocument();
    });

    const clearButton = getByRole('button', { name: /clearInput/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
    });

  });

  it('opens doc preview modal when a document is clicked', async () => {
    (getDocumentsByClientId as jest.Mock).mockResolvedValue({
      content: mockDocuments,
      last: true
    });
    const { getByText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
      expect(getByText(mockDocuments[0].name)).toBeInTheDocument();
    });

    const documentLink = getByText(mockDocuments[0].name);
    fireEvent.click(documentLink);

    await waitFor(() => {
      const modalContent = document.querySelector('[data-testid="doc-preview"]');
      expect(modalContent).toBeVisible();
    });

  });

  it('opens a doc modal when enter key is pressed', async () => {
    (getDocumentsByClientId as jest.Mock).mockResolvedValue({
      content: mockDocuments,
      last: true
    });
    const { getByText } = render(<DocumentsPage docs={DocumentsDisplayType.All} />);
    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
      expect(getByText(mockDocuments[0].name)).toBeInTheDocument();
    });

    const documentLink = getByText(mockDocuments[0].name);
    fireEvent.keyDown(documentLink, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      const modalContent = document.querySelector('[data-testid="doc-preview"]');
      expect(modalContent).toBeVisible();
    });

    const closeButton = getByText('X');
    fireEvent.click(closeButton);
  });

  it('sorts result by name, and date', async () => {
    (getDocumentsByClientId as jest.Mock).mockResolvedValue({
      content: mockDocuments,
      totalElements: mockDocuments.length,
    });

    const { getByText, findAllByTestId } = render(
      <DocumentsPage docs={DocumentsDisplayType.All} />
    );

    await waitFor(() => {
      expect(getDocumentsByClientId).toHaveBeenCalledWith(
        'client-123',
        DocumentsDisplayType.All,
        0,
        10
      );
    });

    fireEvent.click(getByText('documents.fileName'));
    let nameCells = await waitFor(() => findAllByTestId('document-name'));
    const namesAsc = nameCells.map(cell => cell.textContent);
    expect(namesAsc).toEqual([...namesAsc].sort());

    fireEvent.click(getByText('documents.fileName'));
    nameCells = await waitFor(() => findAllByTestId('document-name'));
    const namesDesc = nameCells.map(cell => cell.textContent);
    expect(namesDesc).toEqual([...namesDesc].sort().reverse());

    fireEvent.click(getByText('documents.updatedAt'));
    let updatedCells = await waitFor(() => findAllByTestId('document-updated'));
    const updatedAsc = updatedCells.map(cell => new Date(cell.textContent || ''));
    expect(updatedAsc).toEqual([...updatedAsc].sort((a, b) => a.getTime() - b.getTime()));

    fireEvent.click(getByText('documents.updatedAt'));
    updatedCells = await waitFor(() => findAllByTestId('document-updated'));
    const updatedDesc = updatedCells.map(cell => new Date(cell.textContent || ''));
    expect(updatedDesc).toEqual([...updatedDesc].sort((a, b) => b.getTime() - a.getTime()));

  });

})