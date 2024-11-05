import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { PaginationParams } from '@deps/components/pagination/pagination';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { Carrier, SpecialProgram, TransactionHistory } from '@deps/models/case/withdrawal/case';
import { VariableQuoteResponse } from '@deps/models/case/withdrawal/rmd';
import { Policy, Transaction, TransactionStatus } from '@deps/models/policy/sor-policy';
import { client } from '@deps/queries/api-utils/client';
import { isMockPolicyDetailsRequestEnabled, isMockPolicySearchRequestEnabled } from '@deps/services/api-config';
import { mockPolicy } from '@deps/services/mocks/sor-policy';
import { PolicySearchResponse, SearchViewQuery } from '@deps/types/search';
import { lcPartyResponseSanitizer, policySanitizer, policySanitizerWithoutSSN } from '@deps/utils/sanitizers';
import { logError, logInfo, logTrace, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl, policyApiBaseUrl } from '../api-config';
import { serverApi } from '../api-utils/serverApiClient';

export interface GetPolicyResponse {
    data: Policy;
    message: string;
    status: number;
}

export interface AccountInfo {
    ApplicationDate: string;
    ContractId: string;
    ContractNumber: string;
    ContractStatus: string;
    CovId: string;
    DeathBenefit: string;
    FaceAmount: string | null;
    FreedomDate: string | null;
    IssueDate: string;
    IssueState: string;
    JurisdictionStateCode: string;
    LastAnniversaryDate: string;
    LastTransactionDate: string;
    LastUpdated: string | null;
    LengthOfTerm: string | null;
    MVAProduct: string;
    MaturityDate: string;
    ModelName: string | null;
    ModifiedEndowmentStatus: string;
    NextAnniversaryDate: string;
    OnlineTransactionAuthCode: number;
    OnlineTransactionAuthorized: number;
    Owners: { FullName: string };
    PlanCode: string;
    PlanNumber: string | null;
    ProductCategory: string;
    ProductCompanyId: number;
    ProductLine: string;
    ProductName: string;
    ProductShareClass: string | null;
    QualTypeCode: string;
    QualTypeDesc: string;
    RenewalDate: string | null;
    SourceSystem: string;
    SurrenderChargePeriod: string | null;
    VitalityStatus: string | null;
    eDeliveryStatus: string | null;
}

export interface PolicyNotesInfoItem {
    SourceSystem: string;
    NoteDate: string; // DateTime 'YYYY-MM-DDTHH:MM:SS'
    NoteCategoryDesc: string; // Might be an enum, but uncertain
    NoteText: string; // Where the content of the notes lives
    Alert: string; // Y or N
}

export interface PolicyNotesInfoResponse {
    Count: number;
    Items: PolicyNotesInfoItem[];
}

const baseUrl = baseAppUrl + '/api/policy/v1/policies';

export const searchPolicy = async (query: SearchViewQuery, pagination?: PaginationParams): Promise<PolicySearchResponse> => {
    const queries = new URLSearchParams();

    if (isMockPolicySearchRequestEnabled()) {
        return {
            count: 1,
            total: 1,
            next: '/policy/v1/policies/search?offset=5&limit=5',
            previous: '',
            results: [mockPolicy],
            failures: [],
        };
    }

    if (pagination?.limit !== undefined) {
        queries.append('limit', pagination.limit.toString());
    }
    if (pagination?.offset !== undefined) {
        queries.append('offset', pagination.offset.toString());
    }

    if (Object.keys(query).length >= 0) {
        const { data } = await client.post<SearchViewQuery, AxiosResponse<PolicySearchResponse>>(
            `${baseAppUrl}/api/policies/search?${queries.toString()}`,
            query
        );
        return data;
    }

    return {} as PolicySearchResponse;
};

export const fetchPolicy = async (id?: string, planCode?: string): Promise<Policy | null> => {
    if (isMockPolicyDetailsRequestEnabled()) {
        return mockPolicy;
    }

    if (!id) {
        console.error('No policyNumber to fetch policy');

        return null;
    }

    if (!planCode) {
        console.error('No planCode to fetch policy');

        return null;
    }

    try {
        const { data } = await client.get<any, AxiosResponse<GetPolicyResponse>>(
            `${baseAppUrl}/api/policies/${planCode}/${id}?viewDetails=true`
        );

        if (!data.data) {
            throw new Error('fetchPolicy::Invalid response from API');
        }

        return data.data;
    } catch (e) {
        console.error('Error fetching policy', e);

        return null;
    }
};

export const fetchVersionedPolicy = async (id: string, planCode: string, version: number | null = null): Promise<Policy | null> => {
    if (!id) {
        console.error('No policyNumber to fetch versioned policy');
        return null;
    }

    if (!planCode) {
        console.error('No planCode to fetch versioned policy');
        return null;
    }

    try {
        const { data } = await client.get<any, AxiosResponse<GetPolicyResponse>>(
            `${baseAppUrl}/api/policies/${planCode}/${id}/versions/${version}?viewDetails=true`
        );

        if (!data.data) {
            throw new Error('fetchVersionedPolicy::Invalid response from API');
        }

        return data.data;
    } catch (e) {
        console.error('Error fetching versioned policy', e);
        return null;
    }
};

export const getPolicyDetailsSsr = async (
    id?: string,
    planCode?: string,
    accessToken?: string,
    userInfo: object = {},
    nonSanitizedSSN = false
): Promise<Policy | null> => {
    const loggingContext = { file: 'queries/api/policies', function: 'getPolicyDetailsSSR', ...userInfo };

    if (!id) {
        logWarn('getPolicyDetailsSSR:no policyNumber to fetch policy', loggingContext);

        return null;
    }

    if (!planCode) {
        logWarn('getPolicyDetailsSSR::no planCode to fetch policy', loggingContext);

        return null;
    }

    if (!accessToken) {
        logWarn('getPolicyDetailsSSR::No accessToken to fetch policy', loggingContext);

        return null;
    }

    if (isMockPolicyDetailsRequestEnabled()) {
        return mockPolicy;
    }

    try {
        const url = `${policyApiBaseUrl}/${planCode}/${id}?viewDetails=true`;

        logInfo('getPolicyDetailsSSR', { url, id, ...loggingContext });

        const { data } = await serverApi.get<SearchViewQuery, AxiosResponse<GetPolicyResponse>>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return nonSanitizedSSN ? policySanitizerWithoutSSN(data.data) : policySanitizer(data.data);
    } catch (error: any) {
        logError('getPolicyDetailsSSR', { ...parseErrorInformation(error), id, ...loggingContext });

        return null;
    }
};

// This hits a LifeCAD API
export const getPolicyPartiesSSR = async (
    policyNumber: string,
    clientCode: string,
    accessToken: string | undefined,
    userInfo: object = {}
): Promise<LifeCadParty[] | null> => {
    const loggingContext = { file: 'queries/api/policies', function: 'getPolicyPartiesSSR', ...userInfo };
    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/party?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        logInfo('getPolicyPartiesSSR', { url, policyNumber, clientCode, ...loggingContext });
        const { data } = await serverApi.get<LifeCadParty[], AxiosResponse<LifeCadParty[]>>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return lcPartyResponseSanitizer(data);
    } catch (error: any) {
        logWarn('getPolicyPartiesSSR', { ...parseErrorInformation(error), policyNumber, clientCode, ...loggingContext });
        return null;
    }
};

export const getPolicyParties = async (policyNumber: string, clientCode: string): Promise<LifeCadParty[] | null> => {
    const loggingContext = { file: 'queries/api/policies', function: 'getPolicyParties' };
    try {
        const url = `${baseUrl}/party?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        logInfo('getPolicyParties', { url, policyNumber, clientCode, ...loggingContext });
        const { data } = await client.get<LifeCadParty[], AxiosResponse<LifeCadParty[]>>(url);

        return lcPartyResponseSanitizer(data);
    } catch (error: any) {
        logError('getPolicyParties', { error, policyNumber, clientCode, ...loggingContext });
        return null;
    }
};

export const getPolicyAccountInfo = async (policyNumber: string, clientCode: string): Promise<AccountInfo | null> => {
    try {
        if (!policyNumber) {
            throw new Error('no policy number provided');
        }
        if (!clientCode) {
            throw new Error('no client code provided');
        }
        const { data } = await client.get<AccountInfo | null, AxiosResponse<AccountInfo>>(
            `${baseUrl}/accountInfo?policyNumber=${policyNumber}&clientCode=${clientCode}`
        );

        return data;
    } catch (e) {
        console.error('policies::getPolicyAccountInfo::error', e);
        return null;
    }
};

export const getPolicyAccountInfoSSR = async (policyNumber: string, clientCode: string, accessToken: any): Promise<AccountInfo | null> => {
    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/accountInfo?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        const { data } = await serverApi.get<any, AxiosResponse<AccountInfo>>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return data;
    } catch (e) {
        console.error('policies::getPolicyAccountInfoSSR::error', e);
        return null;
    }
};

/**
 * Makes an attempt to find a unique policy based on the policy number
 * If there is no planCode, it will try and search for a policy using the policy number
 * Only returns policyData if searching by policy number provides exactly one result
 * @param policyNumber
 * @param planCode
 * @returns
 */
export const findUniquePolicy = async (policyNumber: string, planCode?: string): Promise<Policy | null> => {
    if (!policyNumber) {
        return null;
    }

    if (planCode) {
        return await fetchPolicy(policyNumber, planCode);
    } else {
        // BPB - TODO: Remove once all cases have planCode
        const searchResults = await searchPolicy({ policyNumber: policyNumber });
        if (searchResults?.results?.length === 1) {
            return searchResults.results[0];
        }
    }

    // either no policy was found, or multiple policies were found.  Don't return a policy
    return null;
};

type PolicyNotesQuery = {
    clientCode: string;
    limit?: number;
    offset?: number;
    policyNumber: string;
};
export const getPolicyNotesInfo = async ({
    policyNumber,
    clientCode,
    offset = 0,
    limit = 10,
}: PolicyNotesQuery): Promise<PolicyNotesInfoResponse | null> => {
    try {
        const { data } = await client.get<PolicyNotesInfoResponse, AxiosResponse<PolicyNotesInfoResponse>>(
            `${baseUrl}/notesinfo?clientCode=${clientCode}&policyNumber=${policyNumber}&offset=${offset}&limit=${limit}`
        );
        return data;
    } catch (e) {
        console.error('getPolicyNotesInfo::error getting notesInfo', e);
        return null;
    }
};

// This hits a LifeCAD API to get transaction history
export const getPolicyTransactionHistorySSR = async (
    policyNumber: string,
    clientCode: string,
    typeDesc: string,
    transactionType: string,
    accessToken?: string,
    userInfo: object = {}
): Promise<TransactionHistory | null> => {
    const loggingContext = { file: 'queries/api/policies', function: 'getPolicyTransactionHistorySSR', ...userInfo };
    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/transactionHistory?policyNumber=${policyNumber}&TransactionType=${transactionType}&TypeDesc=${typeDesc}&clientCode=${clientCode}&limit=1000`;
        logInfo('getPolicyTransactionHistorySSR', { url, policyNumber, clientCode, typeDesc, transactionType, ...loggingContext });
        const { data } = await serverApi.get<TransactionHistory, AxiosResponse<TransactionHistory>>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data;
    } catch (error: any) {
        logWarn('getPolicyTransactionHistorySSR', {
            ...parseErrorInformation(error),
            policyNumber,
            clientCode,
            typeDesc,
            transactionType,
            ...loggingContext,
        });
        return null;
    }
};

// This hits a LifeCAD API to get transaction history
export const getPolicyTransactionHistory = async (
    policyNumber: string,
    clientCode: string,
    typeDesc: string,
    transactionType: string,
    fromDate: string,
    userInfo: object = {}
): Promise<TransactionHistory | null> => {
    if (!policyNumber || !clientCode || !typeDesc || !transactionType || !fromDate) {
        console.error('queries/api/policies::getPolicyTransactionHistory::missing-args', {
            policyNumber,
            clientCode,
            typeDesc,
            transactionType,
        });
        return null;
    }
    const loggingContext = { file: 'queries/api/policies', function: 'getPolicyTransactionHistory', ...userInfo };
    try {
        const url = `${baseUrl}/transactionHistory?policyNumber=${policyNumber}&TransactionType=${transactionType}&TypeDesc=${typeDesc}&clientCode=${clientCode}&fromDate=${fromDate}&limit=1000`;
        logInfo('getPolicyTransactionHistory', { url, policyNumber, clientCode, typeDesc, transactionType, ...loggingContext });
        const { data } = await client.get<TransactionHistory, AxiosResponse<TransactionHistory>>(url);

        return data;
    } catch (error: any) {
        logWarn('getPolicyTransactionHistory', {
            ...parseErrorInformation(error),
            policyNumber,
            clientCode,
            typeDesc,
            transactionType,
            ...loggingContext,
        });
        return null;
    }
};

export const getSpecialProgramsSSR = async (
    policyNumber: string,
    clientCode: string,
    accessToken?: string
): Promise<SpecialProgram | null> => {
    const loggingContext = {
        file: 'queries/api/policies',
        function: 'getSpecialProgramsSSR',
    };

    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/specialprogramdetails?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        const { data } = await serverApi.get<SpecialProgram | null, AxiosResponse<SpecialProgram>>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return data;
    } catch (error: any) {
        logWarn('getSpecialProgramsSSR', {
            ...parseErrorInformation(error),
            policyNumber,
            clientCode,
            ...loggingContext,
        });
        return null;
    }
};

// This hits a Spectrum API to get Special programs
export const getSpecialPrograms = async (policyNumber: string, clientCode: string): Promise<SpecialProgram | null> => {
    try {
        if (!policyNumber) {
            throw new Error('no policy number provided');
        }
        if (!clientCode) {
            throw new Error('no client code provided');
        }
        const url = `${baseUrl}/specialprogramdetails?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        const { data } = await client.get<SpecialProgram | null, AxiosResponse<SpecialProgram>>(url);
        return data;
    } catch (e) {
        console.error('An error occurred while getting special programs', e);
        return null;
    }
};

// get more information about a single transaction
export const getPolicyTransaction = async (planCode: string, policyNumber: string, transactionId: string): Promise<Transaction | null> => {
    if (!planCode || !policyNumber || !transactionId) {
        console.error('queries/api/policies::getPolicyTransaction::missing-args', { planCode, policyNumber, transactionId });
        return null;
    }

    try {
        const { data } = await client.get(`${baseUrl}/${planCode}/${policyNumber}/transactions/${transactionId}`);
        return data.data;
    } catch (e) {
        console.error('queries/api/policies::getPolicyTransaction::error', e);
        return null;
    }
};

interface PolicyTransactionQuery {
    id?: string;
    limit?: number;
    offset?: number;
    planCode?: string;
    sortOrder?: 'ASC' | 'DESC';
    status?: TransactionStatus | TransactionStatus[];
    transactionTypes?: string[];
    year?: string;
    reverseInitiatorOnly?: boolean;
}

// Get policy transactions by transactionType
export const getPolicyTransactions = async ({
    id: policyNumber,
    limit = 10,
    offset = 0,
    planCode,
    sortOrder = 'ASC',
    status,
    transactionTypes,
    year,
    reverseInitiatorOnly,
}: PolicyTransactionQuery): Promise<Transaction[]> => {
    try {
        const params = new URLSearchParams();

        for (const [key, value] of Object.entries({
            limit,
            offset,
            reverseInitiatorOnly,
            sortOrder,
            status,
            transactionTypes,
            year: year && dayjs(year).format('YYYY-01-01'),
        })) {
            if (value) params.append(key, `${value}`);
        }

        const query = params.toString();
        const url = `${baseUrl}/${planCode}/${policyNumber}/transactions?${query}`;

        const response = await client.get<Transaction, AxiosResponse>(url);

        return response.data.data;
    } catch (error: any) {
        console.error('An error occurred while requesting transactions', error);

        return error.response;
    }
};

// Get variable quote details
type VariableQuoteRequestBody = {
    contractNumber: string;
    clientCode: string;
    valuationDate?: string;
    enableDefaultConfig?: boolean;
};
export const getVariableQuote = async ({
    contractNumber,
    clientCode,
    valuationDate,
    enableDefaultConfig = true,
}: VariableQuoteRequestBody): Promise<VariableQuoteResponse | undefined> => {
    try {
        const query = `?contractNumber=${contractNumber}&clientCode=${clientCode}&enableDefaultConfig=${enableDefaultConfig}&valuationDate=${valuationDate}`;

        const url = `${baseUrl}/getVariableQuote${query}`;
        const response = await client.get<VariableQuoteResponse, AxiosResponse>(url);

        return response.data;
    } catch (error: any) {
        console.error('An error occurred while requesting transactions', error);
    }
};

export const searchPolicySSR = async (
    policyNumber: string,
    carrierIds: Carrier[],
    accessToken: any,
    limit: number,
    offset: number
): Promise<any | null> => {
    try {
        limit = limit || 10;
        offset = offset || 0;
        const searchUrl = `${apiServerBaseUrl}/policy/v1/policies/search?offset=${offset}&limit=${limit}`;
        const formData = {
            policyNumber,
            carrierIds: carrierIds,
        };

        logTrace('searchPolicySSR::start', { url: searchUrl });
        const { data: searchResponse } = await serverApi.post<any>(searchUrl, formData, {
            authorization: 'Bearer ' + accessToken,
        });

        if (!searchResponse.results) {
            console.error('Results array missing from search response');
            return null;
        }

        return searchResponse.results;
    } catch (e) {
        console.error('policies::searchPolicySSR::error', e);
        return null;
    }
};

export const getAssociatedAddresses = async (planCode: string, id: string, partyId?: string | null): Promise<any> => {
    try {
        let url = `${baseAppUrl}/api/policies/${planCode}/${id}/addressDetails`;
        if (partyId) {
            url = url + `?partyId=${partyId}`;
        }
        const { data } = await client.get<any, AxiosResponse<any>>(url);

        return data;
    } catch (error: any) {
        console.error('getAssociatedAddresses::An error occurred while getting associated party addresses', error);
        return error.response;
    }
};
