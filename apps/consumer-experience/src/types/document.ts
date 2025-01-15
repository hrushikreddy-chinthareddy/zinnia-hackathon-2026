import { DocumentMetadata } from '@zinnia/api-types/types/documents';
import {
  MetadataSearchResponse,
  SearchRequest as V3SearchRequestBody,
  SearchDocumentResponse as v3SearchResponse,
} from '@zinnia/api-types/types/documents-v3';

export interface DocumentErrorResponse {
  data: {
    err: string;
  };
  status: number;
  message: string;
}

export interface ExtendedDocumentMeta extends Partial<DocumentMetadata> {
  clientCode?: string;
  documentId?: string; // added due to inconsistency in the Documents API when source=Policy
  documentClassification?: string; // 'INBOUND' | 'OUTBOUND' | 'TAX_FORMS' | 'SERVICE_REQUEST_FORM' // BPB - blah
  downloadSource?: string;
}

export interface DocumentV2SearchResult {
  statusCode: number;
  count: number;
  documents: ExtendedDocumentMeta[];
}

export interface DocumentV3SearchItem extends MetadataSearchResponse {
  documentID?: string; // this is required to provide support for v2 documents.  Should be removed once all v2 documents are migrated
  sourceFileName: string; // this is in the response, but not in the spec (yet).
}

export interface DocumentV3SearchResult extends v3SearchResponse {
  documents: DocumentV3SearchItem[];
  totalCount: number | null; // in the response, but not in the spec (yet) for v3...  BPB - v2 seems busted
}

export interface TaxDocumentApiRequestInputs {
  contractNumber: string;
  taxYear: string;
  numYears: number;
  clientCode: string;
}

export interface TaxDocument {
  contractNumber: string;
  name: string;
  fChar: string;
  formId: string;
  taxYear: string;
}

export interface DocumentApiRequestInputs {
  caseId: string;
  clientCode: string;
  contractNumber: string;
  docStatus: string;
  documentDate: string;
  documentEndDate: string;
  documentNumber: string;
  documentStartDate: string;
  documentType: string;
  importEndDate: string;
  importStartDate: string;
  masterNumber: string;
  planCode: string;
  recipient: 'Client' | 'Agent'; // AS-3029 adds this functionality
  source: string;
  limit?: number;
  offset?: number;
}

export interface DocumentV2DownloadApiRequestInputs {
  source: string;
  clientCode: string;
  policyNumber: string;
  planCode: string;
}

export interface SearchRequestV3 extends V3SearchRequestBody {
  periods?: string; // JSON string of { periodYear: string; periodQuarters: ('Q1' | 'Q2' | 'Q3' | 'Q4')[] }[];
  recipient?: 'Client' | 'Agent';
}

// Note: These inputs are required solely to allow v3 to support v2 documents
// Once the v2 documents are migrated, these inputs can be removed
export interface DocumentV3DownloadApiRequestInputs {
  documentClassification: V3SearchRequestBody.documentClassification;
  parentCarrierCode: string;
}

export interface DocumentResponseError {
  message: string;
  status: number;
}

export enum DocumentCategory {
  // Documents is the default view when there is no query param
  DOCUMENTS = 'documents',
  STATEMENTS = 'statements',
  TAX = 'tax',
}
