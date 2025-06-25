import {
  DownloadDocumentResponse,
  TaxFormsResponse200,
} from '@zinnia/api-types/types/documents';

import { ApiEndpoints } from '@/components/dev-menu/types';
import {
  DocumentApiRequestInputs,
  DocumentV2DownloadApiRequestInputs,
  DocumentV2SearchResult,
  ExtendedDocumentMeta,
  TaxDocument,
  TaxDocumentApiRequestInputs,
} from '@/types/document';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError, logWarn } from '@/utils/logging/log-fns';

import {
  ApiResponse,
  ServerApi,
  documentV2ApiBaseUrl,
  isMockDocumentRequestEnabled,
  isMockDocumentsRequestEnabled,
  isMockErrorEnabled,
} from '../..';
import { mockDocumentResponse } from '../../mocks/document';
import {
  mockDocumentsResponse,
  mockTaxDocumentsResponse,
} from '../../mocks/documents';

const getDocumentsRawV2 = async (documentUrl: string) => {
  const rawResponse = await ServerApi.get(documentUrl);
  const response = await parseAPIResponse(rawResponse);
  if (isMockErrorEnabled(ApiEndpoints.DOCUMENTS)) {
    throw new Error('Error fetching documents.');
  }

  if (!rawResponse?.ok) {
    logError(
      'Error fetching documents',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching documents.', {
      cause: rawResponse.status,
    });
  }

  if (!response) {
    logError(
      'Documents request returned with no data',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching documnts data.');
  }

  return response;
};

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

export const getDocumentsV2 = async (
  queryParams: Partial<DocumentApiRequestInputs>
): Promise<ApiResponse<DocumentV2SearchResult>> => {
  const { clientCode, source } = queryParams;
  const documentQueryParams = buildDocumentQueryParamsV2(queryParams);
  const documentUrl = `${documentV2ApiBaseUrl}/documents?${documentQueryParams.toString()}`;

  if (isMockDocumentsRequestEnabled()) {
    return {
      data: mockDocumentsResponse,
      error: null,
    };
  }

  try {
    const docsData = await getDocumentsRawV2(documentUrl);

    return {
      data: {
        ...docsData,
        documents: docsData?.items?.map(
          ({ documentId, documentID, ...item }: ExtendedDocumentMeta) => ({
            ...item,
            documentId: documentId || documentID,
            clientCode,
            downloadSource: source,
          })
        ),
      },
      error: null,
    };
  } catch (error) {
    logWarn('getDocuments error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getDocuments Error',
      },
    };
  }
};

/**
 * =====================
 * TAX DOCUMENTS
 * =====================
 */
export const getTaxDocumentsV2 = async (
  queryParams: Partial<TaxDocumentApiRequestInputs>
): Promise<ApiResponse<TaxFormsResponse200>> => {
  const { clientCode } = queryParams;
  const documentQueryParams = buildDocumentQueryParamsV2(queryParams);
  const documentUrl = `${documentV2ApiBaseUrl}/taxForms?${documentQueryParams.toString()}`;

  if (isMockDocumentsRequestEnabled()) {
    return {
      data: mockTaxDocumentsResponse,
      error: null,
    };
  }

  try {
    const docsData = await getDocumentsRawV2(documentUrl);
    return {
      data: {
        ...docsData,
        items: docsData?.items?.map((item: TaxDocument) => ({
          ...item,
          clientCode,
        })),
      },
      error: null,
    };
  } catch (error) {
    logWarn('getTaxDocumentsV2 error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getTaxDocumentsV2 Error',
      },
    };
  }
};

export const getTaxDocumentDownloadV2 = async ({
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
}): Promise<ApiResponse<DownloadDocumentResponse>> => {
  try {
    if (isMockDocumentRequestEnabled()) {
      return { data: mockDocumentResponse, error: null };
    }
    const url = `${documentV2ApiBaseUrl}/taxForms/${formId}?clientCode=${carrierId}&fChar=${fChar}&contractNumber=${contractNumber}&taxYear=${taxYear}`;
    const response = await ServerApi.get(url);
    if (!response.ok) {
      throw response;
    }
    return { data: await response.json(), error: null };
  } catch (e) {
    logWarn('getTaxDocumentDownloadV2::Error', {
      error: (e as Error)?.message || (e as Response).statusText,
      file: 'services/document',
      function: 'getTaxDocumentDownloadV2',
    });
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'getTaxDocumentDownloadV2::Error',
        message: 'error getting document',
      },
    };
  }
};
