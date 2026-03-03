import { hasCookie } from 'cookies-next';

import { PolicySortBy } from '@deps/components/policy-index/types';
import { SortOrder } from '@deps/hooks/dashboard/useTableOptions';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { getAgentData } from '@deps/queries/api/agents';
import {
    downloadAsIsIllustration,
    fetchPolicy,
    getPolicyAccountingEntries,
    searchPolicies,
    searchPolicy,
} from '@deps/queries/api/policies';
import { MOCK_COOKIE_KEY } from '@deps/queries/api-utils/serverClientUtils';
import { getMockPolicy } from '@deps/services/mocks/mock-policy.helpers';
import { AccountingEntriesAPIParams } from '@deps/types/accountingEntries';
import { SearchViewQuery } from '@deps/types/search';

export const getPolicyQueryKey = 'policyData';

export const getAccountingEntriesQueryKey = 'accountingEntries';

export const getAccountingEntries = async (
    args: AccountingEntriesAPIParams
) => {
    const response = await getPolicyAccountingEntries(args);

    if (!response) {
        throw 'No accounting entries found';
    }
    return response;
};

export const getPolicyQuery = async (
    id: string,
    planCode: string,
    date?: string
) => {
    const isMocked = hasCookie(MOCK_COOKIE_KEY);
    if (isMocked) {
        return getMockPolicy();
    }

    const response = await fetchPolicy(id, planCode, date);
    if (!response) {
        throw 'No policy found';
    }

    return response;
};

export const getPoliciesQuery = async (
    value: SearchViewQuery,
    limit: number,
    offset: number,
    sortOrder?: SortOrder,
    sortBy?: PolicySortBy
) => {
    const transformedValue = Object.fromEntries(
        Object.entries(value).map(([key, val]) =>
            key === 'ssn' ? [key, val?.replaceAll('-', '')] : [key, val]
        )
    );

    const response = await searchPolicy(
        transformedValue,
        { limit, offset },
        { sortBy, sortOrder }
    );

    if (!response) {
        throw 'No policies found';
    }

    return response;
};

export const getAgentDataQuery = async (
    agentId?: string,
    clientCode?: string,
    policyNumber?: string,
    planCode?: string
) => {
    const result = getAgentData({
        clientCode,
        id: agentId,
        policyNumber,
        planCode,
    });
    if (!result) {
        throw 'No agent data found';
    }
    return result;
};

export const searchPoliciesQuery = async (
    id: string,
    planCode: string,
    carrierIds: Carrier[],
    limit: number,
    offset: number
) => {
    const response = await searchPolicies(
        id,
        planCode,
        carrierIds,
        limit,
        offset
    );

    if (!response) {
        throw 'policies not found';
    }

    return response;
};

export const downloadAsIsIllustrationQuery = async (
    planCode: string,
    policyNumber: string
) => {
    const response = await downloadAsIsIllustration(policyNumber, planCode);

    if (!response) {
        throw 'policies not found';
    }

    return response;
};
