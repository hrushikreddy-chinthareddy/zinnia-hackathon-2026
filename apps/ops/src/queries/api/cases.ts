import { AxiosResponse } from 'axios';

import {
    Case,
    CaseDashboardStatsErrorResponse,
    CaseDashboardStatsResponse,
    CaseReferenceResponse,
    CaseStatsErrorResponse,
    CaseStatsResponse,
    CreateCaseBody,
    CreateCaseResponse,
    DashboardStatsElementResponse,
    Metadata,
} from '@deps/models/case/case';
import { CaseDocument } from '@deps/models/case/document';
import { NoteInstance } from '@deps/models/case/note-instance';
import { CaseDashboardStatsQuery, CaseStatsQuery } from '@deps/queries/cases';
import { isMockCaseDetailsRequestEnabled } from '@deps/services/api-config';
import { mockCaseDetails } from '@deps/services/mocks/case-details';
import { CaseSearchBody, CaseSearchErrorResponse, CaseSearchResponse } from '@deps/types/search';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { caseSanitizer } from '@deps/utils/sanitizers';
import { logError, LoggingContext, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl, se2ApiServerUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

const baseCasesUrl = `${baseAppUrl}/api/case/v1/cases`;
const ssrCasesUrl = `${se2ApiServerUrl}/cases`;
const baseSearchUrl = `${baseAppUrl}/api/enterprise-search/v1/search`;
const ssrSearchUrl = `${se2ApiServerUrl}/enterprise-search/v1/search`;

export type ReferenceDataQuery = {
    carrier?: string[];
    keys?: ('requestSubType' | 'productName' | 'processList')[];
    process?: string[];
};
export interface CaseTimingResponse {
    data: CaseTimingData[];
    totalElements: number;
}

export interface CaseTimingErrorResponse {
    data: {
        err: string;
    };
    status: number;
}

//TODO: Replace this with actual api spec when api publishes
export interface CaseTimingData {
    key: string;
    name: string;
    secondLow: number;
    secondMedian: number;
    secondMean: number;
    secondHigh: number;
    count: number;
}

export const createCase = async (query: CreateCaseBody): Promise<CreateCaseResponse> => {
    try {
        const { data } = await client.post<CreateCaseBody, AxiosResponse>(baseCasesUrl, query);
        browserLogInfo('cases::Successfully created a case', {
            url: baseCasesUrl,
            query,
            id: data?.id ?? '',
            function: 'cases.createCase',
        });
        return data;
    } catch (error: any) {
        console.error('createCase::An error occurred create case ', error);
        browserLogError('cases::Failed to create a case', {
            ...parseErrorInformation(error),
            url: baseCasesUrl,
            query,
            function: 'cases.createCase',
        });
        return error.response;
    }
};

export const getCases = async (query: CaseSearchBody, featureFlags: FeatureFlags): Promise<CaseSearchResponse | CaseSearchErrorResponse> => {
    try {        
        const searchUrl = featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH] 
            ? baseSearchUrl
            : `${baseCasesUrl}/search`;
        const { data } = await client.post<CaseSearchBody, AxiosResponse>(searchUrl, query);

        return data;
    } catch (error: any) {
        console.error('getCases::An error occurred while getting case search results', error);
        return error.response;
    }
};

export const getCaseNotes = async (caseId: string, includeInternal = false): Promise<{ data: NoteInstance[]; status: number }> => {
    try {
        if (!caseId) throw new Error('no caseId provided');
        const caseNotesResponse = await client.get(`${baseCasesUrl}/${caseId}/note?includeInternal=${includeInternal}`);

        return { data: caseNotesResponse?.data ?? [], status: caseNotesResponse?.status ?? 200 };
    } catch (err) {
        return { data: [], status: (err as AxiosResponse)?.status || 500 };
    }
};

export const getCaseStats = async (query: CaseStatsQuery): Promise<CaseStatsResponse | CaseStatsErrorResponse> => {
    try {
        const cachedResult = pullFromCache('getCaseStats', query);

        if (cachedResult) {
            return cachedResult;
        }

        const { data } = await client.post<CaseStatsQuery, AxiosResponse>(`${baseCasesUrl}/stats`, query);

        if (Array.isArray(data?.data) && data?.data?.length > 0) {
            writeToCache('getCaseStats', query, data);
            return data;
        }

        return data ?? {};
    } catch (error: any) {
        console.error('getCaseStats::An error occurred while getting case stats results', error);
        return error.response;
    }
};

const recursivelyFilter = (
    items: DashboardStatsElementResponse[],
    root: DashboardStatsElementResponse | null,
    filterString: string
): DashboardStatsElementResponse[] => {
    return items.filter(item => {
        if (item.name !== filterString) {
            if (item.values) {
                // Recursively process nested values, directly modifying them
                item.values = recursivelyFilter(item.values, item, filterString);
            }
            return true;
        } else {
            if (root) {
                root.count -= item.count; // Directly modify the root count
            }
            return false;
        }
    });
};

export const getCaseDashboardStats = async (
    query: CaseDashboardStatsQuery
): Promise<CaseDashboardStatsResponse | CaseDashboardStatsErrorResponse> => {
    try {
        const { data } = await client.post<
            CaseDashboardStatsQuery,
            AxiosResponse<CaseDashboardStatsResponse | CaseDashboardStatsErrorResponse>
        >(`${baseAppUrl}/api/case/v1/dashboard/stats`, query);

        if (Array.isArray(data?.data) && data?.data?.length > 0) {
            const filteredData = recursivelyFilter(data.data || [], null, 'NOT_APPLICABLE');

            data.data = filteredData;
            return data;
        }
        return { data: [], totalElements: 0 };
    } catch (error: any) {
        console.error('getCaseDashboardStats::An error occurred while getting case dashboard stats results', error);
        if ('response' in error) {
            return error.response;
        }
        return error;
    }
};

export const getCaseTimingData = async (query: CaseDashboardStatsQuery): Promise<CaseTimingResponse | CaseTimingErrorResponse> => {
    try {
        const { data } = await client.post<CaseDashboardStatsQuery, AxiosResponse<CaseTimingResponse | CaseTimingErrorResponse>>(
            `${baseAppUrl}/api/dashboard/case-timing`,
            query
        );

        if (Array.isArray(data?.data) && data?.data?.length > 0) {
            const filteredData = recursivelyFilter(data.data || [], null, 'NOT_APPLICABLE') as CaseTimingData[];

            data.data = filteredData;
            return data;
        }
        return { data: [], totalElements: 0 };
    } catch (error: any) {
        console.error('getCaseTimingData::An error occurred while getting case dashboard stats results', error);
        if ('response' in error) {
            return error.response;
        }
        return error;
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

export const getCaseDetailsSSR = async (id: string, accessToken: string, loggingContext: LoggingContext): Promise<Case | null> => {
    try {
        if (isMockCaseDetailsRequestEnabled()) {
            return mockCaseDetails;
        }

        const url = `${ssrCasesUrl}/${id}`;
        logInfo('getCaseDetailsSSR', { ...loggingContext, file: 'queries/api/cases', function: 'getCaseDetailsSSR', url });

        const { data } = await serverApi.get<null, AxiosResponse>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return caseSanitizer(data);
    } catch (error: any) {
        logError('getCaseDetailsSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
            file: 'queries/api/cases',
            function: 'getCaseDetailsSSR',
        });
        return null;
    }
};

export const getCaseMetadataSSR = async (id: string, accessToken: string, loggingContext: LoggingContext): Promise<Metadata | null> => {
    try {
        const url = `${ssrCasesUrl}/${id}/metadata`;
        logInfo('getCaseMetadataSSR', { ...loggingContext, file: 'queries/api/cases', function: 'getCaseMetadataSSR', url });
        const { data } = await serverApi.get<null, AxiosResponse>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        logError('getCaseMetadataSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
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

export const getReferenceDataSSR = async (
    query: ReferenceDataQuery,
    accessToken: string | undefined,
    loggingContext: LoggingContext
): Promise<CaseReferenceResponse | null> => {
    try {
        const refUrl = `${se2ApiServerUrl}/refdata`;
        const { data } = await serverApi.post<any>(
            refUrl,
            query,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        logWarn('getReferenceData::An error occurred while getting reference data', { ...parseErrorInformation(error), ...loggingContext });
        return error.response;
    }
};

export const searchCasesSSR = async (
    formData: CaseSearchBody,
    accessToken: string | undefined,
    loggingContext: LoggingContext,
    featureFlags: FeatureFlags,
): Promise<CaseSearchResponse | null> => {
    try {
        const searchUrl = featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH] 
            ? ssrSearchUrl
            : `${ssrCasesUrl}/search`;

        logInfo('searchCasesSSR', { ...loggingContext, file: 'queries/api/cases', function: 'searchCasesSSR', url: searchUrl });

        const { data: searchResponse } = await serverApi.post<any>(
            searchUrl,
            formData,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return searchResponse;
    } catch (error: any) {
        logError('searchCasesSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
            file: 'queries/api/cases',
            function: 'searchCasesSSR',
        });
        return null;
    }
};

export const getCaseDocuments = async (id: string): Promise<CaseDocument[]> => {
    try {
        const url = `${baseCasesUrl}/${id}/document`;
        const { data } = await client.get<CaseSearchBody, AxiosResponse>(url);
        console.log('getCaseDocuments', { file: 'queries/api/cases', function: 'getCaseDocuments', url });
        return data;
    } catch (error: any) {
        console.error('getCaseDocuments::An error occurred while getting case document results', error);
        return error.response;
    }
};
