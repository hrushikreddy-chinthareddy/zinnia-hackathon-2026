import { DocumentDownloadResponse, SearchRequest, SearchDocumentResponse as SearchResponse } from '@zinnia/api-types/types/documents-v3';

export type DocumentDownloadV3WithMime = DocumentDownloadResponse & {
    mimeType: string;
};

// BPB - putting this in to get ahead of spec changes that the api has already implemented.
export type SearchDocumentResponse = SearchResponse & {
    totalCount: number;
};

export type DocumentClassification = SearchRequest.documentClassification;
