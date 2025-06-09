import {
  DownloadDocumentResponse,
  TaxFormsResponse200,
} from '@zinnia/api-types/types/documents';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { mockV3DocumentsResponse } from '@/services/mocks/documents-v3';
import {
  DocumentApiRequestInputs,
  TaxDocument,
  TaxDocumentApiRequestInputs,
  DocumentV3SearchResult,
  SearchRequestV3,
  DocumentV3SearchItem,
} from '@/types/document';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError, logWarn } from '@/utils/logging/server-logging';

import {
  ApiResponse,
  ServerApi,
  documentV3ApiBaseUrl,
  isMockDocumentRequestEnabled,
  isMockDocumentsRequestEnabled,
  isMockErrorEnabled,
} from '../..';
import { mockDocumentResponse } from '../../mocks/document';
import { mockTaxDocumentsResponse } from '../../mocks/documents';

const getDocumentsRawV3 = async (documentUrl: string) => {
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

export const getDocumentDownloadV3 = async (
  documentId: string,
  documentClassification: string,
  parentCarrierCode: string
): Promise<ApiResponse<DownloadDocumentResponse>> => {
  const queryParams = buildDocumentQueryParamsV3({
    documentClassification,
    parentCarrierCode,
  });

  try {
    if (isMockDocumentRequestEnabled()) {
      return { data: mockDocumentResponse, error: null };
    }
    // Note: queryParams are only being used to retrieve docs from v2.  Once everything is migrated, we should be able to remove them and just use docId
    const url = `${documentV3ApiBaseUrl}/documents/${documentId}/download?${queryParams}`;
    const response = await ServerApi.get(url);
    if (!response.ok) {
      throw response;
    }
    return { data: await response.json(), error: null };
  } catch (e) {
    logWarn('getDocumentDownloadV3::Error', {
      error: (e as Error)?.message || (e as Response).statusText,
      file: 'services/document',
      function: 'getDocumentDownloadV3',
    });
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'getDocumentDownloadV3::Error',
        message: 'error getting document',
      },
    };
  }
};

export const searchDocumentsV3 = async (
  searchBody: SearchRequestV3,
  limit: number = 500, // 500 docs means we can still do front-end pagination for now
  offset: number = 0
): Promise<ApiResponse<DocumentV3SearchResult>> => {
  const { parentCarrierCode, documentClassification } = searchBody;
  const documentUrl = `${documentV3ApiBaseUrl}/documents/search?limit=${limit}&offset=${offset}`;

  if (isMockDocumentsRequestEnabled()) {
    return {
      data: mockV3DocumentsResponse,
      error: null,
    };
  }

  try {
    if (isMockErrorEnabled(ApiEndpoints.DOCUMENTS)) {
      throw new Error('Error fetching documents.');
    }

    const rawResponse = await ServerApi.post(
      documentUrl,
      JSON.stringify(searchBody),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const response = await parseAPIResponse(rawResponse);
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

      throw new Error('Error fetching documents data.');
    }

    return {
      data: {
        ...response,
        documents: response?.documents?.map(
          ({ documentId, documentID, ...item }: DocumentV3SearchItem) => ({
            ...item,
            documentId: documentId ?? (documentID as string),
            clientCode: parentCarrierCode,
            downloadSource: documentClassification,
          })
        ),
      },
      error: null,
    };
  } catch (error) {
    logWarn('searchDocumentsV3 error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: ((error as Error)?.cause as number) ?? 500,
        name: 'searchDocumentsV3 Error',
      },
    };
  }
};

/**
 * =====================
 * TAX DOCUMENTS
 * =====================
 */
// These endpoints seem exactly the same between v2 and v3
export const getTaxDocumentsV3 = async (
  queryParams: Partial<TaxDocumentApiRequestInputs>
): Promise<ApiResponse<TaxFormsResponse200>> => {
  const { clientCode } = queryParams;
  const documentQueryParams = buildDocumentQueryParamsV3(queryParams);
  const documentUrl = `${documentV3ApiBaseUrl}/tax-forms?${documentQueryParams.toString()}`;
  if (isMockDocumentsRequestEnabled()) {
    return {
      data: mockTaxDocumentsResponse,
      error: null,
    };
  }

  try {
    const docsData = await getDocumentsRawV3(documentUrl);
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
    logWarn('getTaxDocumentsV3 error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getTaxDocuments Error',
      },
    };
  }
};

export const getTaxDocumentDownloadV3 = async ({
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
    const url = `${documentV3ApiBaseUrl}/tax-forms/${formId}/download?clientCode=${carrierId}&fChar=${fChar}&contractNumber=${contractNumber}&taxYear=${taxYear}`;
    const response = await ServerApi.get(url);
    if (!response.ok) {
      throw response;
    }
    return { data: await response.json(), error: null };
  } catch (e) {
    logWarn('getDocument::Error', {
      error: (e as Error)?.message || (e as Response).statusText,
      file: 'services/document',
      function: 'getTaxDocumentDownload',
    });
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'getDocument::Error',
        message: 'error getting document',
      },
    };
  }
};
