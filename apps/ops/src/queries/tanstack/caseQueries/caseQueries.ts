import { AxiosResponse } from 'axios';

import { Statuses } from '@deps/models/case/case';
import {
    getCaseDetails,
    getCases,
    getCaseTimePredict,
} from '@deps/queries/api/cases';
import { getCaseCallLogs } from '@deps/queries/api/contracts';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { CaseSearchQuery, CaseStatsQuery } from '@deps/queries/cases';
import {
    CaseSearchErrorResponse,
    CaseSearchResponse,
} from '@deps/types/search';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

export const getCaseNotesQuery = async (
    caseId: string | undefined,
    includeInternal = false
) => {
    if (!caseId) {
        throw 'No caseId provided';
    }

    const response = await client.get(
        `${baseAppUrl}/api/case/v1/cases/${caseId}/note?includeInternal=${includeInternal}`
    );
    if (!response || !response.data) {
        throw 'No data in response';
    }
    return {
        caseNotes: response.data,
        statusCode: response.status,
    };
};

export const getCasesQuery = async (
    policyNumber?: string,
    featureFlags?: FeatureFlags
) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }

    const response = await getCases(
        {
            limit: 5,
            notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
            policyNumber,
        },
        featureFlags as FeatureFlags
    );

    if (!response) {
        throw 'No data in response';
    }

    return response;
};

export const getCallLogsQuery = async (
    policyNumber?: string,
    carrier?: string,
    limit = 10
) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }

    const results = await getCaseCallLogs({
        contract: policyNumber,
        carrier: carrier || '',
        offset: 0,
        limit,
    });

    return {
        data: results?.data?.items || [],
        status: results?.status,
    };
};

export const getCaseDetailsQuery = async (
    caseId: string,
    featureFlags?: FeatureFlags
) => {
    if (!caseId) {
        throw 'No caseId provided';
    }

    const response = await getCaseDetails(caseId, featureFlags);

    if (!response) {
        throw 'No data in response';
    }

    return response;
};

export const getCaseTimePredictQuery = async (caseId: string) => {
    if (!caseId) {
        throw 'No caseId provided';
    }
    const response = await getCaseTimePredict({ caseId });

    if (!response) {
        throw 'No data in response';
    }

    return response;
};

export const getCaseSearchQuery = async (
    caseSearchQuery?: CaseSearchQuery,
    featureFlags?: FeatureFlags
) => {
    if (!caseSearchQuery) {
        throw 'No caseSearchQuery provided';
    }

    const response = await getCases(
        caseSearchQuery,
        featureFlags as FeatureFlags
    );

    if (!response) {
        throw 'No data in response';
    }

    if ((response as CaseSearchErrorResponse)?.data?.err) {
        throw 'Case search error';
    }

    return response as CaseSearchResponse;
};

export const postCaseStatsQuery = async (caseStatsQuery?: CaseStatsQuery) => {
    if (!caseStatsQuery) {
        throw 'No caseStatsQuery provided';
    }
    const result = await client.post<CaseStatsQuery, AxiosResponse>(
        `${baseAppUrl}/api/case/v1/cases/stats`,
        caseStatsQuery
    );
    if (!result?.data?.stats) {
        throw 'No data in response';
    } else {
        return result.data;
    }
};
