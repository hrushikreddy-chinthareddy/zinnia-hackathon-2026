import { DocumentMetadata } from '@zinnia/api-types/types/documents';

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
  downloadSource?: string;
}

export interface PolicyDocument {
  statusCode: number;
  count: number;
  items: ExtendedDocumentMeta[];
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
