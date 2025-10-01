import {
  DownloadDocumentResponse,
  TaxFormsResponse200,
} from '@zinnia/api-types/types/documents';

import {
  DocumentApiRequestInputs,
  DocumentV2DownloadApiRequestInputs,
  DocumentV2SearchResult,
  ExtendedDocumentMeta,
  TaxDocument,
  TaxDocumentApiRequestInputs,
} from '@/types/document';
import { parseAPIResponse } from '@/utils/api';
import { logWarn } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import {
  ApiResponse,
  ServerApi,
  documentV2ApiBaseUrl,
  isMockDocumentRequestEnabled,
  isMockDocumentsRequestEnabled,
} from '../..';
import { mockDocumentResponse } from '../../mocks/document';
import {
  mockDocumentsResponse,
  mockTaxDocumentsResponse,
} from '../../mocks/documents';

// Remove any params that are null or undefined since this will throw a 400
const buildDocumentQueryParamsV2 = (
  queryParams:
    | Partial<DocumentApiRequestInputs>
    | Partial<DocumentV2DownloadApiRequestInputs>
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

export const getDocumentDownloadV2 = async (
  documentNumber: string,
  source: string,
  clientCode: string,
  policyNumber: string,
  planCode: string
): Promise<ApiResponse<DownloadDocumentResponse>> => {
  const queryParams = buildDocumentQueryParamsV2({
    documentNumber,
    source,
    clientCode,
    policyNumber,
    planCode,
  });

  try {
    if (isMockDocumentRequestEnabled()) {
      return { data: mockDocumentResponse, error: null };
    }
    const url = `${documentV2ApiBaseUrl}/documents/${documentNumber}/download?${queryParams}`;
    const response = await ServerApi.get(url);
    if (!response.ok) {
      throw response;
    }
    return { data: await response.json(), error: null };
  } catch (e) {
    logWarn('getDocumentDownloadV2::Error', {
      error: (e as Error)?.message || (e as Response).statusText,
      file: 'services/document',
      function: 'getDocumentDownloadV2',
    });
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'getDocumentDownloadV2::Error',
        message: 'error getting document',
      },
    };
  }
};

export const getDocumentsV2 = withLogging(
  async (
    queryParams: Partial<DocumentApiRequestInputs>,
    loggingCtx: CommonLogContext
  ): Promise<DocumentV2SearchResult> => {
    const { clientCode, source } = queryParams;
    const documentQueryParams = buildDocumentQueryParamsV2(queryParams);
    const documentUrl = `${documentV2ApiBaseUrl}/documents?${documentQueryParams.toString()}`;

    if (isMockDocumentsRequestEnabled()) {
      return mockDocumentsResponse;
    }

    const rawResponse = await ServerApi.get(documentUrl, undefined, loggingCtx);
    const docsData = await parseAPIResponse(rawResponse);

    return {
      ...docsData,
      documents: docsData?.items?.map(
        ({ documentId, documentID, ...item }: ExtendedDocumentMeta) => ({
          ...item,
          documentId: documentId || documentID,
          clientCode,
          downloadSource: source,
        })
      ),
    };
  },
  {
    file: 'services/document',
    functionName: 'getDocumentsV2',
  }
);

/**
 * =====================
 * TAX DOCUMENTS
 * =====================
 */
export const getTaxDocumentsV2 = withLogging(
  async (
    queryParams: Partial<TaxDocumentApiRequestInputs>,
    loggingCtx: CommonLogContext
  ): Promise<TaxFormsResponse200> => {
    const { clientCode } = queryParams;
    const documentQueryParams = buildDocumentQueryParamsV2(queryParams);
    const documentUrl = `${documentV2ApiBaseUrl}/taxForms?${documentQueryParams.toString()}`;

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
    functionName: 'getTaxDocumentsV2',
  }
);

export const getTaxDocumentDownloadV2 = withLogging(
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
    const url = `${documentV2ApiBaseUrl}/taxForms/${formId}?clientCode=${carrierId}&fChar=${fChar}&contractNumber=${contractNumber}&taxYear=${taxYear}`;
    const response = await ServerApi.get(url, undefined, loggingCtx);
    const parsedResponse = await parseAPIResponse(response);

    return parsedResponse;
  },
  {
    file: 'services/document',
    functionName: 'getTaxDocumentDownloadV2',
  }
);
