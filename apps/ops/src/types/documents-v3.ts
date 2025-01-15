import {
    DocumentDownloadResponse,
    MetadataSearchResponse,
    SearchRequest as SearchRequestBody,
    SearchDocumentResponse as SearchResponse,
} from '@zinnia/api-types/types/documents-v3';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';

export type DocumentDownloadV3WithMime = DocumentDownloadResponse & {
    mimeType: string;
};

// BPB - putting this in to get ahead of spec changes that the api has already implemented.
export type SearchDocumentResponse = SearchResponse & {
    totalCount: number | null;
};

export type V3DocumentWithSource = MetadataSearchResponse & {
    documentSource: DocumentTypeView;
};

export type DocumentClassification = SearchRequestBody.documentClassification;

// Per Amit Agarwal, this should work
export type SearchRequest = SearchRequestBody & {
    periods?: { periodYear: string; periodQuarters: ('Q1' | 'Q2' | 'Q3' | 'Q4')[] }[];
};
