import { dataURItoBlob } from '@rjsf/utils';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import {
    PolicyDocumentApiRequest,
    DocumentData,
    DocumentErrorResponse,
    DocumentDownloadV2,
    DocumentDownloadV2WithMime,
    EDSDocumentResponse,
    PolicyDocument,
} from '@deps/models/case/document';
import { ManagementTask } from '@deps/models/case/task-instance';
import { isMockPolicyDocsRequestEnabled } from '@deps/services/api-config';
import { mockPolicyDocs } from '@deps/services/mocks/policy-docs';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { DocumentDownloadV3WithMime } from '@deps/types/document-download-v3-with-mime';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl } from '../api-config';
import { StatusCode } from '../api-utils/baseAPIClient';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

const ssrBaseUrl = `${apiServerBaseUrl}/document/v2/documents`;
const documentBaseUrl = `${baseAppUrl}/api/document/v2/documents`;

export const getDocumentV2 = async (documentNumber: string, docType: string, clientCode: string): Promise<DocumentData | null> => {
    try {
        const url = `${documentBaseUrl}/${documentNumber}?docType=${docType}&clientCode=${clientCode.toUpperCase()}`;
        const { data } = await client.get<DocumentData, AxiosResponse>(url);

        return data;
    } catch (error: any) {
        console.error('An error occurred while getting document', error);

        return error.response;
    }
};

export const uploadDocumentV2 = async (task: ManagementTask, document: any, correlationId: string): Promise<EDSDocumentResponse | null> => {
    try {
        const url = `${baseAppUrl}/api/documents/upload`;
        const { blob, name } = dataURItoBlob(document);

        const fileData = {
            file: document,
            metadata: {
                sourceFileName: name,
                docAccessLevel: 'CLIENT_COPY',
                documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                docCategory: 'NEW_BUSINESS',
                fileType: blob.type,
                parentCarrierCode: task.carrier.toUpperCase(),
                formType: 'NB Application',
                docClassification: 'INBOUND',
                zinniaLiveCaseId: task.caseId,
                correlationId: correlationId,
            },
        };

        const { data } = await client.post<any, AxiosResponse>(url, fileData);
        return data;
    } catch (error: any) {
        logWarn('An error occurred while uploading document', {
            ...parseErrorInformation(error),
            file: 'queries/api/documents',
            function: 'uploadDocument',
        });

        return error.response;
    }
};

export const downloadDocumentV2 = async (
    documentNumber: string,
    docType: DocumentTypeView,
    clientCode: string
): Promise<DocumentDownloadV2WithMime | null> => {
    try {
        const url = `${baseAppUrl}/api/documents/${documentNumber}/download?clientCode=${clientCode.toUpperCase()}&source=${docType}`;
        const { data } = await client.get<DocumentDownloadV2WithMime, AxiosResponse>(url);
        return data;
    } catch (error: any) {
        logWarn('An error occurred while downloading document', {
            ...parseErrorInformation(error),
            file: 'queries/api/documents',
            function: 'getDocumentDownload',
        });

        return error.response;
    }
};

// note: docType and clientCode are used to allow v3 to hit v2 documents for us.  We can remove if all v2 documents are migrated
export const downloadDocumentV3 = async (
    documentId: string,
    documentClassification: SearchRequest.documentClassification,
    parentCarrierCode: string
): Promise<DocumentDownloadV3WithMime | null> => {
    try {
        const url = `${baseAppUrl}/api/document/v3/documents/${documentId}/download?parentCarrierCode=${parentCarrierCode.toUpperCase()}&documentClassification=${documentClassification}`;
        const { data } = await client.get<DocumentDownloadV3WithMime, AxiosResponse>(url);
        return data;
    } catch (error: any) {
        logWarn('An error occurred while downloading document', {
            ...parseErrorInformation(error),
            file: 'queries/api/documents',
            function: 'downloadDocumentV3',
        });

        return error.response;
    }
};

export const getDocumentPreviewV2 = async (
    documentNumber: string,
    docType: DocumentTypeView,
    clientCode: string
): Promise<DocumentDownloadV2 | null> => {
    try {
        const url = `${baseAppUrl}/api/documents/${documentNumber}/preview?clientCode=${clientCode.toUpperCase()}&source=${docType}`;
        const { data } = await client.get<DocumentDownloadV2, AxiosResponse>(url);

        return data;
    } catch (error: any) {
        logWarn('An error occurred while getting document', {
            ...parseErrorInformation(error),
            file: 'queries/api/documents',
            function: 'getDocumentDownload',
        });

        return error.response;
    }
};

// note: docType and clientCode are used to allow v3 to hit v2 documents for us.  We can remove if all v2 documents are migrated
export const getDocumentPreviewV3 = async (
    documentId: string,
    documentClassification: SearchRequest.documentClassification,
    parentCarrierCode: string
): Promise<DocumentDownloadV3WithMime | null> => {
    try {
        const url = `${baseAppUrl}/api/document/v3/documents/${documentId}/preview?parentCarrierCode=${parentCarrierCode.toUpperCase()}&documentClassification=${documentClassification}`;
        const { data } = await client.get<DocumentDownloadV3WithMime, AxiosResponse>(url);

        return data;
    } catch (error: any) {
        logWarn('An error occurred while getting document', {
            ...parseErrorInformation(error),
            file: 'queries/api/documents',
            function: 'getDocumentPreviewV3',
        });

        return error.response;
    }
};

export const getDocumentV2SSR = async (
    documentNumber: string,
    docType: string,
    clientCode: string,
    accessToken: string | undefined
): Promise<DocumentData | null> => {
    try {
        const url = `${ssrBaseUrl}/${documentNumber}?docType=${docType}&clientCode=${clientCode.toUpperCase()}`;
        logInfo('getDocumentSSR', { url, docType, clientCode, documentNumber, file: 'queries/api/documents', function: 'getDocumentsSSR' });
        const { data } = await serverApi.get<DocumentData, AxiosResponse>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return data;
    } catch (error: any) {
        logWarn('getDocumentSSR', {
            ...parseErrorInformation(error),
            docType,
            clientCode,
            documentNumber,
            file: 'queries/api/documents',
            function: 'getDocumentsSSR',
        });

        return error.response;
    }
};

export type DocumentApiRequestInputs = {
    source: DocumentTypeView;
    clientCode: string;
    contractNumber?: string;
    documentDate?: string;
    documentStartDate?: string;
    documentEndDate?: string;
    documentType?: string;
    importStartDate?: string;
    importEndDate?: string;
    masterNumber?: string;
    docStatus?: string;
    caseId?: string; // OnBase CaseId
    documentNumber?: string;
    recipient?: 'Client' | 'Agent';
    zinniaLiveCaseId?: string;
    periods?: { PeriodYear: string; PeriodQuarters: string[] }[];
    limit?: number;
    offset?: number;
};
export const getDocumentsV2 = async ({
    periods,
    limit,
    offset,
    ...queryParams
}: DocumentApiRequestInputs): Promise<PolicyDocumentApiRequest | DocumentErrorResponse> => {
    try {
        const queryString = new URLSearchParams(queryParams);
        if (periods) {
            queryString.append('periods', JSON.stringify(periods));
        }
        if (limit) {
            queryString.append('limit', `${limit}`);
        }
        if (offset) {
            queryString.append('offset', `${offset}`);
        }
        const cachedResult = pullFromCache('getDocuments', queryString.toString());

        if (cachedResult) return cachedResult;

        const data = await client.get<any, AxiosResponse>(`${documentBaseUrl}?${queryString.toString()}`);

        writeToCache('getDocuments', queryString.toString(), data);

        return data;
    } catch (error: any) {
        console.error('An error occurred while getting document results', error);
        return error.response || error;
    }
};

// Get all documents potentially associated with a case by using caseId and policy and combining the results sets
export const getCaseDocumentsV2 = async ({
    caseId,
    clientCode,
    policyNumber,
    source,
}: {
    caseId: string;
    clientCode: string;
    policyNumber?: string;
    source: DocumentTypeView;
}): Promise<{ data: PolicyDocument[]; error?: { status: number; message: string } }> => {
    if (!caseId || !clientCode || !source) {
        console.error('getAllCaseDocuments::Missing caseId, clientCode, or source');
        return { data: [], error: { status: 400, message: 'Missing caseId, clientCode, or source' } };
    }

    const caseDocRequest = getDocumentsV2({ source, clientCode, zinniaLiveCaseId: caseId });
    const policyDocRequest = policyNumber ? getDocumentsV2({ source, clientCode, contractNumber: policyNumber }) : null;

    try {
        const [caseDocsResponse, policyDocsResponse] = await Promise.all([caseDocRequest, policyDocRequest]);
        const docIds = new Set<string>();
        const docs: PolicyDocument[] = [];

        // if either request is unsuccessful, escape early
        if (caseDocsResponse?.status !== 200 || (policyDocRequest && policyDocsResponse?.status !== 200)) {
            return {
                data: [],
                error: {
                    status: Math.max(caseDocsResponse?.status || 0, policyDocsResponse?.status || 0) || StatusCode.InternalServerError,
                    message:
                        (caseDocsResponse as PolicyDocumentApiRequest)?.statusText ||
                        (caseDocsResponse as DocumentErrorResponse)?.message ||
                        (policyDocsResponse as PolicyDocumentApiRequest)?.statusText ||
                        (policyDocsResponse as DocumentErrorResponse)?.message ||
                        'An error occured while getting documents',
                },
            };
        }

        (caseDocsResponse as PolicyDocumentApiRequest)?.data?.items?.forEach((doc: PolicyDocument) => {
            if (!docIds.has(doc.documentId || (doc.documentID as string))) {
                docIds.add(doc.documentId || (doc.documentID as string));
                docs.push(doc);
            }
        });

        (policyDocsResponse as PolicyDocumentApiRequest)?.data?.items?.forEach((doc: PolicyDocument) => {
            if (!docIds.has(doc.documentId || (doc.documentID as string))) {
                docIds.add(doc.documentId || (doc.documentID as string));
                docs.push(doc);
            }
        });

        return {
            data: docs.sort((a, b) => b.documentDate.localeCompare(a.documentDate)),
        };
    } catch (e) {
        console.error('getAllCaseDocuments::An error occurred while getting case documents', e);
        return { data: [], error: { status: 500, message: 'An unknown error occurred while getting case documents' } };
    }
};

export const getPolicyDocsV2 = async (
    id: string,
    clientCode: string,
    optionalParams: { documentStartDate?: string; documentEndDate?: string } = {}
): Promise<PolicyDocumentApiRequest | DocumentErrorResponse> => {
    try {
        if (isMockPolicyDocsRequestEnabled()) {
            return {
                data: mockPolicyDocs,
                status: 200,
                statusText: 'success',
            };
        }

        let queryParams = `?source=Policy&contractNumber=${id}&clientCode=${clientCode?.toUpperCase()}`;
        if (optionalParams?.documentStartDate) {
            queryParams += `&documentStartDate=${optionalParams.documentStartDate}`;
        }
        if (optionalParams?.documentEndDate) {
            queryParams += `&documentEndDate=${optionalParams.documentEndDate}`;
        }

        const cachedResult = pullFromCache('getPolicyDocs', queryParams);

        if (cachedResult) return cachedResult;

        const data = await client.get<any, AxiosResponse>(`${documentBaseUrl}${queryParams}`);

        writeToCache('getPolicyDocs', queryParams, data);

        return data;
    } catch (error: any) {
        console.error('An error occurred while getting policy document results', error);
        return error;
    }
};

export const getCorrespondenceDocsV2 = async (
    id: string,
    clientCode: string,
    optionalParams: { documentStartDate?: string; documentEndDate?: string; documentType?: string; periods?: string } = {}
): Promise<PolicyDocumentApiRequest | DocumentErrorResponse> => {
    try {
        let queryParams = `?source=Correspondence&contractNumber=${id}&clientCode=${clientCode?.toUpperCase()}`;

        if (optionalParams?.documentStartDate) {
            queryParams += `&documentStartDate=${optionalParams.documentStartDate}`;
        }
        if (optionalParams?.documentEndDate) {
            queryParams += `&documentEndDate=${optionalParams.documentEndDate}`;
        }
        if (optionalParams?.documentType) {
            queryParams += `&documentType=${optionalParams.documentType}`;
        }
        if (optionalParams?.periods) {
            queryParams += `&periods=${optionalParams.periods}`;
        }

        const cachedResult = pullFromCache('getCorrespondenceDocs', queryParams);

        if (cachedResult) return cachedResult;

        const data = await client.get<any, AxiosResponse>(`${documentBaseUrl}${queryParams}`);

        writeToCache('getCorrespondenceDocs', queryParams, data);

        return data;
    } catch (error: any) {
        console.error('An error occurred while getting correspondence document results', error);
        return error;
    }
};

export const getPolicyTypeDocsV2 = async (
    id: string,
    clientCode: string,
    docType?: string
): Promise<PolicyDocumentApiRequest | DocumentErrorResponse> => {
    try {
        let queryParams = `?source=Policy&contractNumber=${id}&clientCode=${clientCode?.toUpperCase()}`;

        if (!isNullEmptyOrUndefined(docType)) {
            queryParams += `&documentType=${docType}`;
        }
        const cachedResult = pullFromCache('getPolicyTypeDocs', queryParams);
        if (cachedResult) return cachedResult;

        const data = await client.get<any, AxiosResponse>(`${documentBaseUrl}${queryParams}`);
        writeToCache('getPolicyTypeDocs', queryParams, data);
        return data;
    } catch (error: any) {
        console.error('getPolicyTypeDocs::An error occurred while getting policy document results', error);
        return error.response;
    }
};
