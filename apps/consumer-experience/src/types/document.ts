import { DocumentMetadata } from '@zinnia/api-types/types/documents';

export interface DocumentErrorResponse {
  data: {
    err: string;
  };
  status: number;
  message: string;
}

export interface ExtendedDocumentMeta extends Partial<DocumentMetadata> {
  documentId?: string; // added due to inconsistency in the Documents API when source=Policy
}

export interface PolicyDocument {
  statusCode: number;
  count: number;
  items: ExtendedDocumentMeta[];
}

export interface DocumentApiRequestInputs {
  source: string;
  clientCode: string;
  contractNumber: string;
  documentDate: string;
  documentStartDate: string;
  documentEndDate: string;
  documentType: string;
  importEndDate: string;
  importStartDate: string;
  masterNumber: string;
  docStatus: string;
  caseId: string;
  documentNumber: string;
}

export interface DocumentResponseError {
  message: string;
  status: number;
}
