import { AxiosResponse } from 'axios';
import dayjs, { Dayjs } from 'dayjs';

import { PaginationParams } from '@deps/components/pagination/pagination';
import { PolicySortBy } from '@deps/components/policy-index/types';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { SortOrder } from '@deps/hooks/dashboard/useTableOptions';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import {
    Carrier,
    SpecialProgram,
    TransactionHistory,
} from '@deps/models/case/withdrawal/case';
import { VariableQuoteResponse } from '@deps/models/case/withdrawal/rmd';
import {
    apiServerBaseUrl,
    baseAppUrl,
    policyApiBaseUrl,
} from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    PolicyTransactionSortField,
    PolicyTransactionSortOrder,
} from '@deps/queries/tanstack/transactions/types';
import {
    isMockPolicyDetailsRequestEnabled,
    isMockPolicySearchRequestEnabled,
} from '@deps/services/api-config';
import {
    mockPolicy,
    mockPolicySearchResult,
} from '@deps/services/mocks/sor-policy';
import {
    AccountingEntriesAPIParams,
    AccountingEntriesAPIResponse,
} from '@deps/types/accountingEntries';
import { CheckTupleResponse } from '@deps/types/fga';
import {
    PolicyReferenceSearchResponse,
    PolicySearchResult,
    SearchViewQuery,
} from '@deps/types/search';
import { TransactionSummary } from '@deps/types/transactions';
import {
    browserLogError,
    browserLogInfo,
    browserLogWarn,
} from '@deps/utils/browser-logging';
import {
    fullyMaskPolicyResponse,
    lcPartyResponseSanitizer,
    policySanitizer,
    policySanitizerWithoutSSN,
} from '@deps/utils/sanitizers';
import {
    logError,
    LoggingContext,
    logInfo,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';
import {
    FullSurrenderQuoteResponse,
    PartialWithdrawalOneTimeQuoteResponse,
    Policy,
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@zinnia/api-types/types/sor';

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

export const searchPolicy = async (
    query: SearchViewQuery,
    pagination?: PaginationParams,
    sortOptions?: {
        sortBy?: PolicySortBy;
        sortOrder?: SortOrder; //TODO: Get this from a better place
    }
): Promise<PolicyReferenceSearchResponse> => {
    const queries = new URLSearchParams();
    if (isMockPolicySearchRequestEnabled()) {
        return {
            count: 1,
            total: 1,
            next: '/policy/v1/policies/search?offset=5&limit=5',
            previous: '',
            results: [mockPolicySearchResult],
        };
    }

    if (pagination?.limit !== undefined) {
        queries.append('limit', pagination.limit.toString());
    }
    if (pagination?.offset !== undefined) {
        queries.append('offset', pagination.offset.toString());
    }

    if (sortOptions?.sortBy) {
        queries.append('sortBy', sortOptions.sortBy);
    }

    if (sortOptions?.sortOrder) {
        queries.append('sortOrder', sortOptions.sortOrder);
    }

    if (Object.keys(query).length >= 0) {
        const { data } = await client.post<
            SearchViewQuery,
            AxiosResponse<PolicyReferenceSearchResponse>
        >(`${baseAppUrl}/api/policies/search?${queries.toString()}`, query);
        return data;
    }

    return {} as PolicyReferenceSearchResponse;
};

export const fetchPolicy = async (
    id?: string,
    planCode?: string,
    date?: string
): Promise<Policy | null> => {
    if (isMockPolicyDetailsRequestEnabled()) {
        return mockPolicy;
    }

    if (!id) {
        browserLogInfo('fetchPolicy::No policyNumber to fetch policy', {
            poicyNumber: id,
            planCode: planCode,
            file: 'policies::fetchPolicy',
        });
        return null;
    }

    if (!planCode) {
        browserLogInfo('fetchPolicy::No planCode to fetch policy', {
            poicyNumber: id,
            planCode: planCode,
            file: 'policies::fetchPolicy',
        });
        return null;
    }

    const dateParam = date ? `&date=${date}` : '';
    try {
        const { data } = await client.get<
            any,
            AxiosResponse<GetPolicyResponse>
        >(
            `${baseAppUrl}/api/policies/${planCode}/${id}?viewDetails=true${dateParam}`
        );

        if (!data.data) {
            browserLogInfo('fetchPolicy::Policy data not', {
                poicyNumber: id,
                planCode: planCode,
                file: 'policies::fetchPolicy',
            });
            throw new Error('fetchPolicy::Invalid response from API');
        }

        browserLogInfo('fetchPolicy::Successfully retrieved policy', {
            poicyNumber: id,
            planCode: planCode,
            file: 'policies::fetchPolicy',
        });
        return data.data;
    } catch (e) {
        browserLogError('fetchPolicy::Error fetchin policy', {
            ...parseErrorInformation(e),
            poicyNumber: id,
            planCode: planCode,
            file: 'policies::fetchPolicy',
        });
        return null;
    }
};

export const fetchVersionedPolicy = async (
    id: string,
    planCode: string,
    version: number | null = null
): Promise<Policy | null> => {
    if (!id) {
        console.error('No policyNumber to fetch versioned policy');
        return null;
    }

    if (!planCode) {
        console.error('No planCode to fetch versioned policy');
        return null;
    }

    try {
        const { data } = await client.get<
            any,
            AxiosResponse<GetPolicyResponse>
        >(
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
    id: string | undefined,
    planCode: string | undefined,
    accessToken: string | undefined,
    logCtx: LoggingContext,
    nonSanitizedSSN = false
): Promise<Policy | null> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/policies',
        function: 'getPolicyDetailsSSR',
        inputs: { id, planCode, nonSanitizedSSN },
    };

    if (!id) {
        logWarn(
            'getPolicyDetailsSSR:no policyNumber to fetch policy',
            loggingContext
        );

        return null;
    }

    if (!planCode) {
        logWarn(
            'getPolicyDetailsSSR::no planCode to fetch policy',
            loggingContext
        );

        return null;
    }

    if (!accessToken) {
        logWarn(
            'getPolicyDetailsSSR::No accessToken to fetch policy',
            loggingContext
        );

        return null;
    }

    if (isMockPolicyDetailsRequestEnabled()) {
        return mockPolicy;
    }

    try {
        const url = `${policyApiBaseUrl}/${planCode}/${id}?viewDetails=true`;

        logInfo('getPolicyDetailsSSR', { ...loggingContext, url });

        const unmaskingRequest = serverApi.post<
            any,
            AxiosResponse<CheckTupleResponse>
        >(
            `${apiServerBaseUrl}/fga/v1/check`,
            {
                user: `party:${logCtx?.user?.partyId}`,
                relation: 'unmask_pii',
                object: `policy:${id}_${planCode}`,
            },
            { authorization: 'Bearer ' + accessToken },
            loggingContext
        );

        const policyRequest = serverApi.get<
            SearchViewQuery,
            AxiosResponse<GetPolicyResponse>
        >(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            loggingContext
        );

        const [unmaskingResponse, policyResponse] = await Promise.all([
            unmaskingRequest,
            policyRequest,
        ]);

        // Do not show ANY PII if the user is not authorized to view it for the policy in question
        if (!unmaskingResponse.data?.allowed) {
            return fullyMaskPolicyResponse(policyResponse.data)?.data;
        }

        return nonSanitizedSSN
            ? policySanitizerWithoutSSN(policyResponse?.data?.data)
            : policySanitizer(policyResponse?.data?.data);
    } catch (error: any) {
        logError('getPolicyDetailsSSR', {
            ...parseErrorInformation(error),
            id,
            ...loggingContext,
        });

        return null;
    }
};

// This hits a LifeCAD API
export const getPolicyPartiesSSR = async (
    policyNumber: string,
    clientCode: string,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<LifeCadParty[] | null> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/policies',
        function: 'getPolicyPartiesSSR',
        inputs: { policyNumber, clientCode },
    };
    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/party?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        logInfo('getPolicyPartiesSSR', {
            ...loggingContext,
            url,
            policyNumber,
            clientCode,
        });
        const data = await serverApi.get<
            LifeCadParty[],
            AxiosResponse<LifeCadParty[]>
        >(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            loggingContext
        );

        if (data?.status === 500) {
            browserLogError(
                'getPolicyPartiesSSR:: Error fetching parties from policies'
            );
            throw new Error(
                'getPolicyPartiesSSR:: Error fetching parties from policies'
            );
        }
        return lcPartyResponseSanitizer(data?.data);
    } catch (error: any) {
        console.error('getPolicyPartiesSSR::error getting policy info', error);
        logError('getPolicyPartiesSSR', {
            ...parseErrorInformation(error),
            policyNumber,
            clientCode,
            ...loggingContext,
        });
        return null;
    }
};

export const getPolicyParties = async (
    policyNumber: string,
    clientCode: string
): Promise<LifeCadParty[] | null> => {
    const loggingContext = {
        file: 'queries/api/policies',
        function: 'getPolicyParties',
    };
    try {
        const url = `${baseUrl}/party?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        browserLogInfo('getPolicyParties', {
            url,
            policyNumber,
            clientCode,
            ...loggingContext,
        });
        const { data } = await client.get<
            LifeCadParty[],
            AxiosResponse<LifeCadParty[]>
        >(url);

        return lcPartyResponseSanitizer(data);
    } catch (error: any) {
        browserLogError('getPolicyParties', {
            error,
            policyNumber,
            clientCode,
            ...loggingContext,
        });
        return null;
    }
};

export const getPolicyAccountInfo = async (
    policyNumber: string,
    clientCode: string
): Promise<AccountInfo | null> => {
    try {
        if (!policyNumber) {
            throw new Error('no policy number provided');
        }
        if (!clientCode) {
            throw new Error('no client code provided');
        }
        const { data } = await client.get<
            AccountInfo | null,
            AxiosResponse<AccountInfo>
        >(
            `${baseUrl}/accountInfo?policyNumber=${policyNumber}&clientCode=${clientCode}`
        );

        return data;
    } catch (e) {
        console.error('policies::getPolicyAccountInfo::error', e);
        return null;
    }
};

export const getPolicyAccountInfoSSR = async (
    policyNumber: string,
    clientCode: string,
    accessToken: any,
    logCtx: LoggingContext
): Promise<AccountInfo | null> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/policies',
        function: 'getPolicyAccountInfoSSR',
        inputs: { policyNumber, clientCode },
    };
    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/accountInfo?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        const { data } = await serverApi.get<any, AxiosResponse<AccountInfo>>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            loggingContext
        );
        return data;
    } catch (e) {
        console.error('policies::getPolicyAccountInfoSSR::error', e);
        return null;
    }
};

export const getPolicyAccountingEntries = async ({
    limit = 50,
    offset = 0,
    ...optionalParams
}: AccountingEntriesAPIParams): Promise<AccountingEntriesAPIResponse | null> => {
    try {
        let accountingEntriesUrl = `${baseAppUrl}/api/policy/v1/accountingentries`;

        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries({
            limit,
            offset,
            ...optionalParams,
        })) {
            if (value !== undefined) queryParams.append(key, String(value));
        }

        accountingEntriesUrl += `?${queryParams.toString()}`;

        const results = await client.get<
            null,
            AxiosResponse<AccountingEntriesAPIResponse>
        >(accountingEntriesUrl);

        return results.data;
    } catch (e) {
        browserLogWarn('policies::getPolicyAccountingEntries::error', {
            ...parseErrorInformation(e),
        });
        return null;
    }
};

type PolicyNotesQuery = {
    policyNumber: string;
    planCode: string;
};
export const getPolicyNotesInfo = async ({
    policyNumber,
    planCode,
}: PolicyNotesQuery): Promise<PolicyNotesInfoResponse | null> => {
    try {
        const endpoint = `${baseUrl}/${planCode}/${policyNumber}/notes`;

        if (!planCode) {
            browserLogError(
                'getPolicyNotesInfo::planCode is required for FAST policies'
            );

            throw new Error(
                'getPolicyNotesInfo::planCode is required for FAST policies'
            );
        }

        browserLogInfo('getPolicyNotesInfo::Fetching Diary Notes Data');

        const data = await client.get<
            PolicyNotesInfoResponse,
            AxiosResponse<PolicyNotesInfoResponse>
        >(endpoint);

        if (data?.status === 500) {
            browserLogError('getPolicyNotesInfo:: Diary Notes API failed');

            throw new Error(
                'getPolicyNotesInfo::Error fetching Dairy Notes Data'
            );
        }

        browserLogInfo('getPolicyNotesInfo Diary Notes Data fetched', {
            data,
        });

        return data?.data;
    } catch (e) {
        console.error('getPolicyNotesInfo::error getting notesInfo', e);
        browserLogError('getPolicyNotesInfo::error getting Diary Notes data', {
            ...parseErrorInformation(e),
        });

        return null;
    }
};

// This hits a LifeCAD API to get transaction history
export const getPolicyTransactionHistorySSR = async (
    policyNumber: string,
    clientCode: string,
    typeDesc: string,
    transactionType: string,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<TransactionHistory | null> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/policies',
        function: 'getPolicyTransactionHistorySSR',
        inputs: { policyNumber, clientCode, typeDesc, transactionType },
    };
    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/transactionHistory?policyNumber=${policyNumber}&TransactionType=${transactionType}&TypeDesc=${typeDesc}&clientCode=${clientCode}&limit=1000`;
        logInfo('getPolicyTransactionHistorySSR', { ...loggingContext, url });
        const { data } = await serverApi.get<
            TransactionHistory,
            AxiosResponse<TransactionHistory>
        >(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        logWarn('getPolicyTransactionHistorySSR', {
            ...parseErrorInformation(error),
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
    if (
        !policyNumber ||
        !clientCode ||
        !typeDesc ||
        !transactionType ||
        !fromDate
    ) {
        console.error(
            'queries/api/policies::getPolicyTransactionHistory::missing-args',
            {
                policyNumber,
                clientCode,
                typeDesc,
                transactionType,
            }
        );
        return null;
    }
    const loggingContext = {
        file: 'queries/api/policies',
        function: 'getPolicyTransactionHistory',
        ...userInfo,
    };
    try {
        const url = `${baseUrl}/transactionHistory?policyNumber=${policyNumber}&TransactionType=${transactionType}&TypeDesc=${typeDesc}&clientCode=${clientCode}&fromDate=${fromDate}&limit=1000`;
        browserLogInfo('getPolicyTransactionHistory', {
            url,
            policyNumber,
            clientCode,
            typeDesc,
            transactionType,
            ...loggingContext,
        });
        const data = await client.get<
            TransactionHistory,
            AxiosResponse<TransactionHistory>
        >(url);

        if (data?.status === 500) {
            browserLogError(
                'getPolicyTransactionHistory:: Failed to fetch transaction history'
            );

            throw new Error(
                'getPolicyTransactionHistory:: Failed to fetch transaction history'
            );
        }

        return data?.data;
    } catch (error: any) {
        browserLogError('getPolicyTransactionHistory', {
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
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<SpecialProgram | null> => {
    const loggingContext = {
        ...logCtx,
        inputs: { policyNumber, clientCode },
        file: 'queries/api/policies',
        function: 'getSpecialProgramsSSR',
    };

    try {
        const url = `${apiServerBaseUrl}/policy/v1/policies/specialprogramdetails?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        const { data } = await serverApi.get<
            SpecialProgram | null,
            AxiosResponse<SpecialProgram>
        >(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            loggingContext
        );
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
export const getSpecialPrograms = async (
    policyNumber: string,
    clientCode: string
): Promise<SpecialProgram | null> => {
    try {
        if (!policyNumber) {
            throw new Error('no policy number provided');
        }
        if (!clientCode) {
            throw new Error('no client code provided');
        }
        const url = `${baseUrl}/specialprogramdetails?policyNumber=${policyNumber}&clientCode=${clientCode}`;
        const { data } = await client.get<
            SpecialProgram | null,
            AxiosResponse<SpecialProgram>
        >(url);
        return data;
    } catch (e) {
        console.error('An error occurred while getting special programs', e);
        return null;
    }
};

// get more information about a single transaction
export const getPolicyTransaction = async (
    planCode: string,
    policyNumber: string,
    transactionId: string
): Promise<Transaction | null> => {
    if (!planCode || !policyNumber || !transactionId) {
        console.error(
            'queries/api/policies::getPolicyTransaction::missing-args',
            { planCode, policyNumber, transactionId }
        );
        return null;
    }

    try {
        const { data } = await client.get(
            `${baseUrl}/${planCode}/${policyNumber}/transactions/${transactionId}`
        );
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
    sortField?: PolicyTransactionSortField;
    sortOrder?: PolicyTransactionSortOrder;
    status?: TransactionStatus | TransactionStatus[];
    transactionTypes?: readonly string[];
    year?: string;
    reverseInitiatorOnly?: boolean;
    from?: Dayjs;
    to?: Dayjs;
}

// Get policy transactions by transactionType
// DEPRECATED (only Zahara supports detailed transactions on the search endpoint)
/**
 * @deprecated - only Zahara supports detailed transactions on the search endpoint.  Remove once the revised_history_table feature flag is cleaned up
 * @param param0
 * @returns
 */
export const getPolicyTransactions = async ({
    id: policyNumber,
    limit,
    offset,
    planCode,
    sortField = 'EFFECTIVEDATE',
    sortOrder = 'ASC',
    status,
    transactionTypes,
    year,
    reverseInitiatorOnly,
    from,
    to,
}: PolicyTransactionQuery): Promise<Transaction[]> => {
    try {
        const params = new URLSearchParams();

        for (const [key, value] of Object.entries({
            limit,
            offset,
            reverseInitiatorOnly,
            sortField,
            sortOrder,
            status,
            transactionTypes,
            year: year && dayjs(year).format('YYYY-01-01'),
            startDate: from && dayjs(from).format('YYYY-MM-DD'),
            endDate: to && dayjs(to).format('YYYY-MM-DD'),
        })) {
            if (value) params.append(key, `${value}`);
        }

        const query = params.toString();
        const url = `${baseUrl}/${planCode}/${policyNumber}/transactions?${query}`;

        const response = await client.get<Transaction, AxiosResponse>(url);

        return response.data.data;
    } catch (error: any) {
        browserLogWarn(
            'getPolicyTransactions:: An error occurred while requesting transactions',
            error
        );

        return error.response;
    }
};

interface PolicyTransactionsSummaryQuery {
    endDate?: string; // Zahara API date format (YYYY-MM-DD)
    limit?: number;
    offset?: number;
    planCode: string | undefined;
    policyNumber: string | undefined;
    reverseInitiatorOnly?: boolean;
    sortField?: PolicyTransactionSortField;
    sortOrder?: PolicyTransactionSortOrder;
    startDate?: string; // Zahara API date format (YYYY-MM-DD)
    status?: string[];
    transactionTypes?: string[];
    version?: number;
    year?: string;
}
// Get summarized policy transactions by transactionType
export const getPolicyTransactionsSummary = async ({
    planCode,
    policyNumber,
    sortField = 'EFFECTIVEDATE',
    sortOrder = 'ASC',
    ...rest
}: PolicyTransactionsSummaryQuery): Promise<TransactionSummary[]> => {
    try {
        const params = new URLSearchParams();

        for (const [key, value] of Object.entries({
            sortField,
            sortOrder,
            ...rest,
            viewDetails: false, // Only Zahara supports viewDetails, so this should remain false for compatibility with other SORs
        })) {
            if (!isNullEmptyOrUndefined(value)) params.append(key, `${value}`);
        }

        const query = params.toString();
        const url = `${baseUrl}/${planCode}/${policyNumber}/transactions?${query}`;

        const response = await client.get<{ data: TransactionSummary[] }>(url);

        return response.data.data;
    } catch (error: any) {
        browserLogWarn(
            'getPolicyTransactionsSummary:: An error occurred while requesting transactions',
            error
        );

        return error.response;
    }
};
enum WithdrawalQuoteEndpointType {
    FullSurrender = 'fullsurrender',
    PartialWithdrawalOneTime = 'partialwithdrawalonetime',
}

export const policyWithdrawalQuote = async (
    planCode: string | undefined,
    policyNumber?: string,
    transactionType?: TransactionType,
    requestBody?: any
): Promise<any> => {
    if (!planCode || !policyNumber || !transactionType || !requestBody) {
        console.error('policyWithdrawalQuote::missing-args');

        return null;
    }

    try {
        const type =
            transactionType === TransactionType.FULL_SURRENDER
                ? WithdrawalQuoteEndpointType.FullSurrender
                : WithdrawalQuoteEndpointType.PartialWithdrawalOneTime;

        const { data } = await client.post<
            any,
            AxiosResponse<
                | FullSurrenderQuoteResponse
                | PartialWithdrawalOneTimeQuoteResponse
            >
        >(
            `${baseAppUrl}/api/policy/v1/policies/${planCode}/${policyNumber}/${type}/quote`,
            requestBody
        );

        return data;
    } catch (error: any) {
        console.error(
            'policyWithdrawalQuote::an error occurred during policy withdrawal quote',
            error
        );

        return error?.data;
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
        const response = await client.get<VariableQuoteResponse, AxiosResponse>(
            url
        );

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
    offset: number,
    logCtx: LoggingContext
): Promise<PolicySearchResult[] | null> => {
    const loggingContext = {
        ...logCtx,
        function: 'searchPolicySSR',
        file: 'queries/api/policies',
        inputs: {
            policyNumber,
            carrierIds,
            limit,
            offset,
        },
    };
    limit = limit || 10;
    offset = offset || 0;
    const searchUrl = `${apiServerBaseUrl}/policy/v1/policies/reference/search?offset=${offset}&limit=${limit}`;
    const formData = {
        policyNumber,
        carrierIds: carrierIds,
    };
    try {
        logInfo('searchPolicySSR::Started policy search', loggingContext);
        const { data: searchResponse } = await serverApi.post<any>(
            searchUrl,
            formData,
            {
                authorization: 'Bearer ' + accessToken,
            },
            loggingContext
        );

        if (!searchResponse.results) {
            logInfo('searchPolicySSR::Policy search result not found', {
                ...loggingContext,
                url: searchUrl,
            });
            return null;
        }
        logInfo('searchPolicySSR::Completed policy search', {
            ...loggingContext,
            url: searchUrl,
            payload: formData,
            records: searchResponse?.results?.length,
        });
        return searchResponse.results;
    } catch (e) {
        logInfo('searchPolicySSR::Policy search failed', {
            ...loggingContext,
            url: searchUrl,
            ...parseErrorInformation(e),
        });
        return null;
    }
};

export const getAssociatedAddresses = async (
    planCode: string,
    id: string,
    partyId?: string | null
): Promise<any> => {
    try {
        let url = `${baseAppUrl}/api/policies/${planCode}/${id}/addressDetails`;
        if (partyId) {
            url = url + `?partyId=${partyId}`;
        }
        const { data } = await client.get<any, AxiosResponse<any>>(url);

        return data;
    } catch (error: any) {
        console.error(
            'getAssociatedAddresses::An error occurred while getting associated party addresses',
            error
        );
        return error.response;
    }
};

export const searchPolicies = async (
    policyNumber: string,
    planCode: string,
    carrierIds: Carrier[],
    limit: number,
    offset: number
): Promise<PolicySearchResult[] | null> => {
    browserLogInfo(
        'searchPolicies::Searching policy by policy number & plan code',
        {
            url: `${baseAppUrl}/api/policy/v1/policies/reference/search?offset=${offset}&limit=${limit}`,
            policyNumber,
            planCode,
            carrierIds,
            limit,
            offset,
        }
    );
    try {
        limit = limit || 10;
        offset = offset || 0;
        const url = `${baseAppUrl}/api/policy/v1/policies/reference/search?offset=${offset}&limit=${limit}`;
        const formData = {
            policyNumber,
            planCode,
            carrierIds: carrierIds,
        };

        const { data } = await client.post<any, AxiosResponse<any>>(
            url,
            formData
        );

        return data.results;
    } catch (error: any) {
        browserLogError(
            'searchPolicies::An error occurred while getting policies',
            {
                policyNumber,
                planCode,
                carrierIds,
                limit,
                offset,
                error,
                url: `${baseAppUrl}/api/policy/v1/policies/reference/search?offset=${offset}&limit=${limit}`,
            }
        );
        return error.response;
    }
};
