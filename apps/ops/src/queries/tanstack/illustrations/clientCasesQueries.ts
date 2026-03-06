import { queryOptions } from '@tanstack/react-query';

import {
    createClientCase,
    patchClientCase,
    searchClientCase,
    archiveIllustration,
    selectIllustrationForApplication,
    unarchiveIllustration,
} from '@deps/queries/api/v1/client-case-manager';
import {
    getIllustrationAsyncCalculationStatus,
    getNewIndexedUniversalLifeIllustration,
    getNewTermLifeIllustration,
} from '@deps/queries/api/v3/illustrations';
import {
    ClientCaseSearchInputs,
    IllustrationsClientCaseSearchResponse,
    IllustrationProductType,
    IllustrationsClientCase,
    IllustrationType,
} from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

export function filterClientCaseDataFromQueryString(
    data: IllustrationsClientCase[],
    filter: ClientCaseSearchInputs
): IllustrationsClientCase[] {
    const filtered = data.filter((item) => {
        return Object.entries(filter).every(([key, searchVal]) => {
            if (
                searchVal === '' ||
                searchVal === undefined ||
                searchVal === null
            )
                return true;

            const lowerSearchVal = searchVal.toString().toLowerCase();
            let targetVal = '';

            switch (key) {
                case 'caseTitle':
                    targetVal = item.title || '';
                    break;
                case 'insuredFirstName':
                    targetVal = item.insuredDetails?.firstName || '';
                    break;
                case 'insuredLastName':
                    targetVal = item.insuredDetails?.lastName || '';
                    break;
                case 'agentFirstName':
                    targetVal = item.agentDetails?.firstName || '';
                    break;
                case 'agentLastName':
                    targetVal = item.agentDetails?.lastName || '';
                    break;
                default:
                    return true; // ignore unknown keys
            }

            return targetVal.toLowerCase().includes(lowerSearchVal);
        });
    });

    const { offset, limit } = filter;

    if (typeof offset === 'number' && typeof limit === 'number') {
        return filtered.slice(offset, offset + limit);
    }

    return filtered;
}

export const searchIllustrationsClientCases = async (
    searchFilter: ClientCaseSearchInputs
): Promise<IllustrationsClientCaseSearchResponse> => {
    const data = await searchClientCase(searchFilter);

    return {
        limit: searchFilter.limit || 10,
        offset: searchFilter.offset || 0,
        results: data.results,
        total: data.count,
        count: data.results?.length || 0,
    } as IllustrationsClientCaseSearchResponse; //filteredResults;
};

export const postIllustrationsClientCase = async (
    query: Partial<IllustrationsClientCase>
) => {
    const response = await createClientCase(query);

    if (response?.error || !response?.data) {
        throw response;
    } else {
        return response.data;
    }
};

export const patchIllustrationsClientCase = async (
    query: Partial<IllustrationsClientCase>
): Promise<IllustrationsClientCase> => {
    const response = await patchClientCase(query);

    if (response?.error || !response?.data) {
        throw response;
    } else {
        return response.data;
    }
};

export const getIllustrationQueryOptions = (
    illustrationId: string | null,
    productType: IllustrationProductType | null,
    illustrationType: IllustrationType = 'NEW_BUSINESS'
) => {
    return queryOptions({
        queryKey: [
            'illustrationData',
            illustrationId,
            illustrationType,
            productType,
        ],
        queryFn: async () => {
            if (illustrationType === 'INFORCE') {
                throw Error('Not implemented');
            }

            if (productType === ProductTypes.TERM) {
                return getNewTermLifeIllustration(illustrationId!);
            }

            if (productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
                return getNewIndexedUniversalLifeIllustration(illustrationId!);
            }

            throw Error(`Invalid productType: ${productType}`);
        },
        enabled: !!illustrationId && !!productType,
    });
};

export const getIllustrationCalculationStatus = async (
    illustrationId: string
) => {
    return await getIllustrationAsyncCalculationStatus(illustrationId);
};

export const selectIllustrationForClientCase = async (
    clientCaseId: string,
    illustrationId: string
) => {
    const { data } = await selectIllustrationForApplication(
        clientCaseId,
        illustrationId
    );
    return data;
};

export const archiveIllustrationInClientCase = async (
    clientCaseId: string,
    illustrationId: string
) => {
    const { data } = await archiveIllustration(clientCaseId, illustrationId);
    return data;
};

export const unarchiveIllustrationInClientCase = async (
    clientCaseId: string,
    illustrationId: string
) => {
    const { data } = await unarchiveIllustration(clientCaseId, illustrationId);
    return data;
};
