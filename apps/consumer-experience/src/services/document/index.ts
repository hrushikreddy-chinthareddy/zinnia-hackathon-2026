import { DownloadDocumentResponse } from '@zinnia/api-types/types/documents';

import { DocumentApiRequestInputs, PolicyDocument } from '@/types/document';
import { logWarn } from '@/utils/logging/server-logging';

import {
  ApiResponse,
  ServerApi,
  documentApiBaseUrl,
  isMockDocumentRequestEnabled,
} from '..';
import { mockDocumentResponse } from '../mocks/document';

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

export const getDocuments = async (
  queryParams: Partial<DocumentApiRequestInputs>
): Promise<PolicyDocument> => {
  const { clientCode, source } = queryParams;
  const documentQueryParams = new URLSearchParams();
  for (const key in queryParams) {
    if (queryParams[key as keyof typeof queryParams] !== undefined) {
      documentQueryParams.append(
        key,
        queryParams[key as keyof typeof queryParams] as string
      );
    }
  }
  const documentUrl = `${documentApiBaseUrl}?${documentQueryParams.toString()}`;

  const response = await ServerApi.get(documentUrl);

  if (response.status !== 200) {
    throw new Error(`API returned an error. Status code: ${response.status}`);
  }

  const data = (await response.json()) as PolicyDocument;
  return {
    ...data,
    items: data?.items?.map(item => ({
      ...item,
      clientCode,
      downloadSource: source,
    })),
  };
};
