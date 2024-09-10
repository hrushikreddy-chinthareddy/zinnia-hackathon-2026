import { AxiosResponse } from 'axios';

import {
    PolicyDocumentApiRequest,
    DocumentData,
    DocumentErrorResponse,
    DocumentDownload,
    DocumentDownloadWithMime,
} from '@deps/models/case/document';
import { isMockPolicyDocsRequestEnabled } from '@deps/services/api-config';
import { mockPolicyDocs } from '@deps/services/mocks/policy-docs';
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
            }
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
    optionalParams: { documentStartDate?: string; documentEndDate?: string } = {}
): Promise<PolicyDocumentApiRequest | DocumentErrorResponse> => {
    try {
        let queryParams = `?source=Correspondence&contractNumber=${id}&clientCode=${clientCode?.toUpperCase()}`;

        if (optionalParams?.documentStartDate) {
            queryParams += `&documentStartDate=${optionalParams.documentStartDate}`;
        }
        if (optionalParams?.documentEndDate) {
            queryParams += `&documentEndDate=${optionalParams.documentEndDate}`;
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
