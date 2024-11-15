import { dataURItoBlob } from '@rjsf/utils';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import {
    PolicyDocumentApiRequest,
    DocumentData,
    DocumentErrorResponse,
    DocumentDownload,
    DocumentDownloadWithMime,
    EDSDocumentResponse,
} from '@deps/models/case/document';
import { ManagementTask } from '@deps/models/case/task-instance';
import { Policy } from '@deps/models/policy/sor-policy';
import { isMockPolicyDocsRequestEnabled } from '@deps/services/api-config';
import { mockPolicyDocs } from '@deps/services/mocks/policy-docs';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

const ssrBaseUrl = `${apiServerBaseUrl}/document/v2/documents`;
const documentBaseUrl = `${baseAppUrl}/api/document/v2/documents`;

export const getDocument = async (documentNumber: string, docType: string, clientCode: string): Promise<DocumentData | null> => {
    try {
        const url = `${documentBaseUrl}/${documentNumber}?docType=${docType}&clientCode=${clientCode.toUpperCase()}`;
        const { data } = await client.get<DocumentData, AxiosResponse>(url);

        return data;
    } catch (error: any) {
        console.error('An error occurred while getting document', error);

        return error.response;
    }
};

export const uploadDocument = async (task: ManagementTask, policy: Policy, document: any): Promise<EDSDocumentResponse | null> => {
    try {
        const url = `${baseAppUrl}/api/documents/upload`;
        const { blob, name } = dataURItoBlob(document);

        // TODO: Update metadata
        const fileData = {
            file: document,
            metadata: {
                sourceFileName: name,
                docAccessLevel: 'ALL_ACCESS',
                documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT), //'2024-11-15T10:21:33.690Z',
                docCategory: 'NEW_BUSINESS',
                fileType: blob.type,
                parentCarrierCode: task.carrier.toUpperCase(),
                formType: 'NB Application',
                docClassification: 'INBOUND',
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

export const downloadDocument = async (
    documentNumber: string,
    docType: string,
    clientCode: string
): Promise<DocumentDownloadWithMime | null> => {
    try {
        const url = `${baseAppUrl}/api/documents/${documentNumber}/download?clientCode=${clientCode.toUpperCase()}&source=${docType}`;
        const { data } = await client.get<DocumentDownloadWithMime, AxiosResponse>(url);
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

export const getDocumentPreview = async (documentNumber: string, docType: string, clientCode: string): Promise<DocumentDownload | null> => {
    try {
        const url = `${baseAppUrl}/api/documents/${documentNumber}/preview?clientCode=${clientCode.toUpperCase()}&source=${docType}`;
        const { data } = await client.get<DocumentDownload, AxiosResponse>(url);

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

export const getDocumentSSR = async (
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

export const getPolicyDocs = async (
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
        return error.response;
    }
};

export const getCorrespondenceDocs = async (
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
        return error.response;
    }
};

export const getPolicyTypeDocs = async (
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
function uuidV4(): any | import('axios').AxiosHeaderValue | undefined {
    throw new Error('Function not implemented.');
}
