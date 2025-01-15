import { dataURItoBlob } from '@rjsf/utils';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { PolicyDocumentApiRequest, DocumentData, DocumentErrorResponse, EDSDocumentResponse } from '@deps/models/case/document';
import { ManagementTask } from '@deps/models/case/task-instance';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

const ssrBaseUrl = `${apiServerBaseUrl}/document/v2/documents`;
export const documentBaseUrl = `${baseAppUrl}/api/document/v2/documents`;

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
    periods?: { periodYear: string; periodQuarters: string[] }[];
    limit?: number;
    offset?: number;
};

// BPB - DEPU-2827: this is just a helper method to get OUTBOUND docs.
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

// BPB - DEPU-2827: This is being used to grab documents by document number.  Will need documentNumber as a potential search param
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
