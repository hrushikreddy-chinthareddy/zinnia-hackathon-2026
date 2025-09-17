import { render, waitFor } from "@testing-library/react";
import axios from "axios";

import { DEFAULT_LOCALE } from "@deps/helpers/routing.helpers";
import { getDocumentPreview } from "@deps/queries/api/knowledge-base";

import DocumentPreview from "./document-preview";



const mockDocument = {
  driveId: 'mock-drive-id',
  itemId: 'mock-item-id',
  name: 'mock-document-name.pdf',
  webUrl: 'https://example.com/document.pdf',
  createdAt: '2023-08-10T12:34:56.789Z',
  updatedAt: '2023-08-10T12:34:56.789Z',
};
const mockArrayBuffer = new Uint8Array([1, 2, 3]).buffer;
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockBlobUrl = "blob:http://localhost/fake-blob-url";
const mockBrowserLogError = jest.fn();

jest.mock('@deps/queries/api/knowledge-base', () => ({
  getDocumentPreview: jest.fn(),
}));
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: DEFAULT_LOCALE,
    },
  }),
}));
jest.mock('@deps/utils/browser-logging', () => {
  return {
    browserLogError: (...args: any[]) => mockBrowserLogError(...args),
  };
});

describe('Document Preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    global.URL.createObjectURL = jest.fn(() => mockBlobUrl);
  });

  it('renders loading state when fetching document', async () => {
    (getDocumentPreview as jest.Mock).mockResolvedValue(null);
    const { getByTestId } = render(<DocumentPreview document={mockDocument} />);
    expect(getByTestId('doc-preview-loader')).toBeInTheDocument();
  });

  it('renders the document preview', async () => {
    const mockBlob = new Blob(["test content"], { type: "application/pdf" });
    mockedAxios.get.mockResolvedValueOnce({ data: mockBlob });
    (getDocumentPreview as jest.Mock).mockResolvedValue({ data: mockArrayBuffer });
    const { getByTestId } = render(<DocumentPreview document={mockDocument} />);
    await waitFor(() => {
      const iframe = getByTestId("doc-preview-iframe");
      expect(iframe).toHaveAttribute("src", expect.stringContaining("blob:"));
    });
  });

  it('logs error when fails to fetch documents and shows document preview is not available', async () => {
    (getDocumentPreview as jest.Mock).mockRejectedValue(undefined);
    const { getByText } = render(<DocumentPreview document={mockDocument} />);

    await waitFor(() => {
      expect(mockBrowserLogError).toHaveBeenCalled();
      expect(getByText('documents.noPreview')).toBeInTheDocument();
    })
  })

})