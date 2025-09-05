import { DocumentV3SearchItem, ExtendedDocumentMeta } from '@/types/document';

// DocumentTypes for both Old and New Correspondence APIs that map to a statement-y doctype
// https://zinnia.atlassian.net/wiki/spaces/SISED/pages/3834871816/SED+New+Document+Types+-+Next+Gen+Correspondence
// https://zinnia.atlassian.net/wiki/spaces/SISED/pages/3013640218/SED+Document+Types
const StatementDocumentTypes = ['ANNSTM', 'ANNSTME', 'ANN', 'SOA'];

/**
 * Checks if a document type is a statement type.
 * @param doc the document to check
 * @returns true if the document type is a statement type, false otherwise
 */
export const statementsFilter = (
  doc: ExtendedDocumentMeta | DocumentV3SearchItem
) => StatementDocumentTypes.includes(doc.documentType as string);

/**
 * Checks if a document is an email. We might add other file extensions in the future.
 * @param doc the document to check
 * @returns true if the document is an email, false otherwise
 */
export const extensionsFilter = (
  doc: ExtendedDocumentMeta | DocumentV3SearchItem
) => !['eml'].includes(doc.fileType ?? '');

/**
 * Filters documents to only include documents that:
 * - Are not emails
 * - Are not statements
 * @param docs the documents to filter
 * @returns the filtered documents
 */
export const filterDocuments = (
  docs?: (ExtendedDocumentMeta | DocumentV3SearchItem)[]
) => {
  return (docs?.filter(doc => !statementsFilter(doc)) ?? []) as
    | ExtendedDocumentMeta[]
    | DocumentV3SearchItem[];
};

/**
 * Filters documents to only include documents that:
 * - Are not emails
 * - Are statements
 * @param docs the documents to filter
 * @returns the filtered documents
 */
export const filterStatements = (
  docs?: (ExtendedDocumentMeta | DocumentV3SearchItem)[]
) => {
  return (docs?.filter(doc => statementsFilter(doc)) ?? []) as
    | ExtendedDocumentMeta[]
    | DocumentV3SearchItem[];
};
