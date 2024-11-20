import { DownloadDocumentResponse } from '@zinnia/api-types/types/documents';

import { DocumentApiRequestInputs, PolicyDocument } from '@/types/document';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError, logWarn } from '@/utils/logging/server-logging';

import {
  ApiResponse,
  ServerApi,
  documentApiBaseUrl,
  isMockDocumentRequestEnabled,
} from '..';
import { mockDocumentResponse } from '../mocks/document';

const getDocumentsRaw = async (documentUrl: string) => {
  const rawResponse = await ServerApi.get(documentUrl);
  const response = (await parseAPIResponse(rawResponse)) as PolicyDocument;

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
    const url = `${documentApiBaseUrl}/${documentNumber}/download?clientCode=${clientCode.toUpperCase()}&source=${source}&planCode=${planCode}&policyNumber=${policyNumber}`;
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
  const documentUrl = `${documentApiBaseUrl}?${documentQueryParams.toString()}`;
  try {
    const docsData = await getDocumentsRaw(documentUrl);

    return {
      data: {
        ...docsData,
        items: docsData?.items?.map(item => ({
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

export const getTaxDocuments = async (
  queryParams: Partial<
    DocumentApiRequestInputs & { taxYear: string; numYears: number }
  >
): Promise<ApiResponse<PolicyDocument>> => {
  const { clientCode } = queryParams;
  const documentQueryParams = getDocumentQueryParams(queryParams);
  const documentUrl = `${documentApiBaseUrl}/taxDocs?${documentQueryParams.toString()}`;

  try {
    const docsData = await getDocumentsRaw(documentUrl);

    return {
      data: {
        ...docsData,
        items: docsData?.items?.map(item => ({
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
