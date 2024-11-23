import {
  DownloadDocumentResponse,
  TaxFormsResponse200,
} from '@zinnia/api-types/types/documents';

import { ApiEndpoints } from '@/components/dev-menu/types';
import {
  DocumentApiRequestInputs,
  PolicyDocument,
  TaxDocument,
  TaxDocumentApiRequestInputs,
} from '@/types/document';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError, logWarn } from '@/utils/logging/server-logging';

import {
  ApiResponse,
  ServerApi,
  documentApiBaseUrl,
  isMockDocumentRequestEnabled,
  isMockDocumentsRequestEnabled,
  isMockErrorEnabled,
} from '..';
import { mockDocumentResponse } from '../mocks/document';
import { mockTaxDocumentsResponse } from '../mocks/documents';

const getDocumentsRaw = async (documentUrl: string) => {
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

export const getDocumentDownload = async (
  documentNumber: string,
  source: string,
  clientCode: string,
  policyNumber: string,
  planCode: string
): Promise<ApiResponse<DownloadDocumentResponse>> => {
  try {
    if (isMockDocumentRequestEnabled()) {
      return { data: mockDocumentResponse, error: null };
    }
    const url = `${documentApiBaseUrl}/documents/${documentNumber}/download?clientCode=${clientCode.toUpperCase()}&source=${source}&planCode=${planCode}&policyNumber=${policyNumber}`;
    const response = await ServerApi.get(url);
    if (!response.ok) {
      throw response;
    }
    return { data: await response.json(), error: null };
  } catch (e) {
    logWarn('getDocument::Error', {
      error: (e as Error)?.message || (e as Response).statusText,
      file: 'services/document',
      function: 'getDocumentDownload',
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

const getDocumentQueryParams = (
  queryParams: Partial<DocumentApiRequestInputs>
) => {
  const documentQueryParams = new URLSearchParams();
  for (const key in queryParams) {
    if (queryParams[key as keyof typeof queryParams] !== undefined) {
      documentQueryParams.append(
        key,
        queryParams[key as keyof typeof queryParams] as string
      );
    }
  }
  return documentQueryParams;
};

export const getDocuments = async (
  queryParams: Partial<DocumentApiRequestInputs>
): Promise<ApiResponse<PolicyDocument>> => {
  const { clientCode, source } = queryParams;
  const documentQueryParams = getDocumentQueryParams(queryParams);
  const documentUrl = `${documentApiBaseUrl}/documents?${documentQueryParams.toString()}`;
  try {
    const docsData = await getDocumentsRaw(documentUrl);

    return {
      data: {
        ...docsData,
        items: docsData?.items?.map((item: PolicyDocument) => ({
          ...item,
          clientCode,
          downloadSource: source,
        })),
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
export const getTaxDocuments = async (
  queryParams: Partial<TaxDocumentApiRequestInputs>
): Promise<ApiResponse<TaxFormsResponse200>> => {
  const { clientCode } = queryParams;
  const documentQueryParams = getDocumentQueryParams(queryParams);
  const documentUrl = `${documentApiBaseUrl}/taxDocs?${documentQueryParams.toString()}`;

  if (isMockDocumentsRequestEnabled()) {
    return {
      data: mockTaxDocumentsResponse,
      error: null,
    };
  }

  try {
    const docsData = await getDocumentsRaw(documentUrl);

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
    logWarn('getTaxDocuments error', { error });

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

export const getTaxDocumentDownload = async ({
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
    // TODO: call clientCode carrierId to follow pattern from everywhere else?
    const url = `${documentApiBaseUrl}/taxForms/${formId}?clientCode=${carrierId}&fChar=${fChar}&contractNumber=${contractNumber}&taxYear=${taxYear}`;
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
