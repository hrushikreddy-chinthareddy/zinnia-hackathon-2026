import { AxiosResponse } from 'axios';

import {
    Case,
    CaseReferenceResponse,
    CaseStatsErrorResponse,
    CaseStatsResponse,
    CreateCaseBody,
    CreateCaseResponse,
    Metadata,
} from '@deps/models/case/case';
import { NoteInstance } from '@deps/models/case/note-instance';
import { CaseStatsQuery } from '@deps/queries/cases';
import { isMockCaseDetailsRequestEnabled } from '@deps/services/api-config';
import { mockCaseDetails } from '@deps/services/mocks/case-details';
import { CaseSearchBody, CaseSearchErrorResponse, CaseSearchResponse } from '@deps/types/search';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { caseSanitizer } from '@deps/utils/sanitizers';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl, se2ApiServerUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

const baseCasesUrl = `${baseAppUrl}/api/case/v1/cases`;
const ssrCasesUrl = `${se2ApiServerUrl}/cases`;

export type ReferenceDataQuery = {
    carrier?: string[];
    keys?: ('requestSubType' | 'productName' | 'processList')[];
    process?: string[];
};

export const createCase = async (query: CreateCaseBody): Promise<CreateCaseResponse> => {
    try {
        const { data } = await client.post<CreateCaseBody, AxiosResponse>(baseCasesUrl, query);

        return data;
    } catch (error: any) {
        console.error('createCase::An error occurred create case ', error);
        return error.response;
    }
};

export const getCases = async (query: CaseSearchBody): Promise<CaseSearchResponse | CaseSearchErrorResponse> => {
    try {
        const { data } = await client.post<CaseSearchBody, AxiosResponse>(`${baseCasesUrl}/search`, query);

        return data;
    } catch (error: any) {
        console.error('getCases::An error occurred while getting case search results', error);
        return error.response;
    }
};

export const getCaseNotes = async (caseId: string, includeInternal = false): Promise<NoteInstance[]> => {
    try {
        if (!caseId) throw new Error('no caseId provided');
        const caseNotesResponse = await client.get(`${baseCasesUrl}/${caseId}/note?includeInternal=${includeInternal}`);

        return caseNotesResponse?.data ?? [];
    } catch (err) {
        console.warn('getCaseNotes::error getting case notes', err);
        return [];
    }
};

export const getCaseStats = async (query: CaseStatsQuery): Promise<CaseStatsResponse | CaseStatsErrorResponse> => {
    try {
        const cachedResult = pullFromCache('getCaseStats', query);

        if (cachedResult) {
            return cachedResult;
        }

        const { data } = await client.post<CaseStatsQuery, AxiosResponse>(`${baseCasesUrl}/stats`, query);

        writeToCache('getCaseStats', query, data);

        return data;
    } catch (error: any) {
        console.error('getCaseStats::An error occurred while getting case stats results', error);
        return error.response;
    }
};

export const getCaseDetails = async (id: string): Promise<Case | null> => {
    try {
        const url = `${baseCasesUrl}/case-by-id/${id}`;

        const { data } = await client.get<null, AxiosResponse>(url);

        return data;
    } catch (error: any) {
        console.error('getCaseDetails', { ...parseErrorInformation(error), id, file: 'queries/api/cases', function: 'getCaseDetails' });
        return null;
    }
};

export const getCaseDetailsSSR = async (id: string, accessToken: string): Promise<Case | null> => {
    try {
        if (isMockCaseDetailsRequestEnabled()) {
            return mockCaseDetails;
        }

        const url = `${ssrCasesUrl}/${id}`;
        logInfo('getCaseDetailsSSR', { file: 'queries/api/cases', function: 'getCaseDetailsSSR', url });

        const { data } = await serverApi.get<null, AxiosResponse>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return caseSanitizer(data);
    } catch (error: any) {
        logError('getCaseDetailsSSR', { ...parseErrorInformation(error), id, file: 'queries/api/cases', function: 'getCaseDetailsSSR' });
        return null;
    }
};

export const getCaseMetadataSSR = async (id: string, accessToken: string): Promise<Metadata | null> => {
    try {
        const url = `${ssrCasesUrl}/${id}/metadata`;
        logInfo('getCaseMetadataSSR', { file: 'queries/api/cases', function: 'getCaseMetadataSSR', url });
        const { data } = await serverApi.get<null, AxiosResponse>(url, {
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
        logError('getCaseMetadataSSR', {
            ...parseErrorInformation(error),
            id,
            file: 'queries/api/cases',
            function: 'getCaseMetadataSSR',
        });
        return null;
    }
};

export const getReferenceData = async (query: ReferenceDataQuery): Promise<CaseReferenceResponse | null> => {
    try {
        const cachedResult = pullFromCache('getReferenceData', query);

        if (cachedResult) {
            return cachedResult;
        }
        const { data } = await client.post<ReferenceDataQuery, AxiosResponse>(`${baseAppUrl}/api/case/v1/refdata`, query);

        writeToCache('getReferenceData', query, data, 10);

        return data;
    } catch (error: any) {
        console.error('getReferenceData::An error occurred while getting reference data', error);
        return error.response;
    }
};

export const searchCasesSSR = async (formData: CaseSearchBody, accessToken: string | undefined): Promise<CaseSearchResponse | null> => {
    try {
        const searchUrl = `${ssrCasesUrl}/search`;
        logInfo('searchCasesSSR', { file: 'queries/api/cases', function: 'searchCasesSSR', searchUrl });

        const { data: searchResponse } = await serverApi.post<any>(searchUrl, formData, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return searchResponse;
    } catch (error: any) {
        logError('searchCasesSSR', {
            ...parseErrorInformation(error),
            file: 'queries/api/cases',
            function: 'searchCasesSSR',
        });
        return null;
    }
};
