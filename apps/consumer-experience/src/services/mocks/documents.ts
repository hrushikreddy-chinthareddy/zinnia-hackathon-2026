import { PolicyDocument } from '@/types/document';

export const mockDocumentsResponse: PolicyDocument = {
  statusCode: 200,
  count: 2,
  items: [
    {
      documentId: '16479517',
      importDate: '2024-03-29T16:43:09-05:00',
      documentDate: '2024-03-29T16:42:28-05:00',
      displayName: 'Annuity Application for MMBD SMITH RAYMOND - 3/29/2024',
      documentType: 'Annuity Application',
      contractNumber: '571024290',
      docStatus: 'Active',
      caseId: 9737773,
      documentNumber: '20240329-M-479517',
      // source: 'ETP',
      fileType: 'HTML',
    },
    {
      documentId: '16479520',
      importDate: '2024-03-29T16:50:59-05:00',
      documentDate: '2024-03-29T16:50:58-05:00',
      displayName:
        'Attachment IMPORTANT NOTICE: REPLACEMENT OF LIFE INSURANCE OR ANNUITIES 7  - 3/29/2024',
      documentType: 'Attachment',
      contractNumber: '571024290',
      docStatus: 'Active',
      caseId: 9737773,
      documentNumber: '20240329-M-479520',
      // source: 'ETP',
      fileType: 'PDF',
    },
  ],
};
