import {
  DownloadDocumentResponse,
  TaxFormsResponse200,
} from '@zinnia/api-types/types/documents';

import { mockV3DocumentsResponse } from '@/services/mocks/documents-v3';
import {
  DocumentApiRequestInputs,
  TaxDocument,
  TaxDocumentApiRequestInputs,
  DocumentV3SearchResult,
  SearchRequestV3,
  DocumentV3SearchItem,
} from '@/types/document';
import { parseAPIResponse } from '@/utils/api';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import {
  ServerApi,
  documentV3ApiBaseUrl,
  isMockDocumentRequestEnabled,
  isMockDocumentsRequestEnabled,
} from '../..';
import { mockDocumentResponse } from '../../mocks/document';
import { mockTaxDocumentsResponse } from '../../mocks/documents';

// Remove any params that are null or undefined since this will throw a 400
const buildDocumentQueryParamsV3 = (
  queryParams:
    | { [key: string]: string | number | boolean | undefined }
    | Partial<DocumentApiRequestInputs>
    | Partial<DownloadDocumentResponse>
) => {
  const documentQueryParams = new URLSearchParams();
  for (const key in queryParams) {
    if (queryParams[key as keyof typeof queryParams] != undefined) {
      documentQueryParams.append(
        key,
        queryParams[key as keyof typeof queryParams] as string
      );
    }
  }
  return documentQueryParams;
};

export const getDocumentDownloadV3 = withLogging(
  async (
    documentId: string,
    documentClassification: string,
    parentCarrierCode: string,
    loggingContext: CommonLogContext
  ): Promise<DownloadDocumentResponse> => {
    const queryParams = buildDocumentQueryParamsV3({
      documentClassification,
      parentCarrierCode,
    });

    if (isMockDocumentRequestEnabled()) {
      return mockDocumentResponse;
    }
    // Note: queryParams are only being used to retrieve docs from v2.  Once everything is migrated, we should be able to remove them and just use docId
    const url = `${documentV3ApiBaseUrl}/documents/${documentId}/download?${queryParams}`;
    const rawResponse = await ServerApi.get(url, undefined, loggingContext);
    const response = await parseAPIResponse(rawResponse);

    return response;
  },
  {
    file: 'services/document',
    functionName: 'getDocumentDownloadV3',
  }
);

export const searchDocumentsV3 = withLogging(
  async (
    searchBody: SearchRequestV3,
    //TODO: move limit and offset into an object
    limit: number = 500, // 500 docs means we can still do front-end pagination for now
    offset: number = 0,
    loggingContext: CommonLogContext
  ): Promise<DocumentV3SearchResult> => {
    const { parentCarrierCode, documentClassification } = searchBody;
    const documentUrl = `${documentV3ApiBaseUrl}/documents/search?limit=${limit}&offset=${offset}`;

    if (isMockDocumentsRequestEnabled()) {
      return mockV3DocumentsResponse;
    }

    const rawResponse = await ServerApi.post(
      documentUrl,
      JSON.stringify(searchBody),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingContext
    );
    const response = await parseAPIResponse(rawResponse);

    return {
      ...response,
      documents: response?.documents?.map(
        ({ documentId, documentID, ...item }: DocumentV3SearchItem) => ({
          ...item,
          documentId: documentId ?? (documentID as string),
          clientCode: parentCarrierCode,
          downloadSource: documentClassification,
        })
      ),
    };
  },
  { file: 'services/document', functionName: 'searchDocumentsV3' }
);

/**
 * =====================
 * TAX DOCUMENTS
 * =====================
 */
// These endpoints seem exactly the same between v2 and v3
export const getTaxDocumentsV3 = withLogging(
  async (
    queryParams: Partial<TaxDocumentApiRequestInputs>,
    loggingCtx: CommonLogContext
  ): Promise<TaxFormsResponse200> => {
    const { clientCode } = queryParams;
    const documentQueryParams = buildDocumentQueryParamsV3(queryParams);
    const documentUrl = `${documentV3ApiBaseUrl}/tax-forms?${documentQueryParams.toString()}`;
    if (isMockDocumentsRequestEnabled()) {
      return mockTaxDocumentsResponse;
    }

    const rawResponse = await ServerApi.get(documentUrl, undefined, loggingCtx);
    const docsData = await parseAPIResponse(rawResponse);
    return {
      ...docsData,
      items: docsData?.items?.map((item: TaxDocument) => ({
        ...item,
        clientCode,
      })),
    };
  },
  {
    file: 'services/document',
    functionName: 'getTaxDocumentsV3',
  }
);

export const getTaxDocumentDownloadV3 = withLogging(
  async (
    {
      formId,
      taxYear,
      carrierId,
      fChar,
      contractNumber,
    }: {
      formId: string;
      taxYear: string;
      carrierId: string;
      fChar: string;
      contractNumber: string;
    },
    loggingCtx: CommonLogContext
  ): Promise<DownloadDocumentResponse> => {
    if (isMockDocumentRequestEnabled()) {
      return mockDocumentResponse;
    }
    const url = `${documentV3ApiBaseUrl}/tax-forms/${formId}/download?clientCode=${carrierId}&fChar=${fChar}&contractNumber=${contractNumber}&taxYear=${taxYear}`;
    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);
    const response = await parseAPIResponse(rawResponse);

    return response;
  },
  { file: 'services/document', functionName: 'getTaxDocumentDownloadV3' }
);
