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
    periods?: {
        periodYear: string;
        periodQuarters: ('Q1' | 'Q2' | 'Q3' | 'Q4')[];
    }[];
    masterAgentNumber?: string;
};
// The v3 request is the same as the v2 request
export interface TaxDocumentApiRequestInputs {
    contractNumber: string;
    taxYear: string;
    numYears: number;
    clientCode: string;
}
export const SourceSystem = { ZL: 'ZL' };

export type DocumentMetadata = {
    documentInfoId: string;
    parentCarrierCode: string;
    documentCategory: string;
    documentType: string;
    formNumber: string;
    documentTypeDescription: string;
    companyName: string;
    documentClassification: DocumentClassification;
    applicableState: string;
    createDate: string;
    documentCategoryKey: string;
};

export type DocumentMetaDataRequest = {
    parentCarrierCode: string;
    documentType?: string;
    documentCategory?: string;
};

export enum DocumentAccessLevel {
    CLIENT_COPY = 'CLIENT_COPY',
    AGENT_COPY = 'AGENT_COPY',
    CARRIER_ONLY = 'CARRIER_ONLY',
}
