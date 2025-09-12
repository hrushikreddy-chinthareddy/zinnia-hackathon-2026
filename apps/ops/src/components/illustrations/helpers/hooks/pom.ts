import {
    queryOptions,
    useQueries,
    useQuery,
    UseQueryResult,
} from '@tanstack/react-query';
import { first, groupBy, sortBy, uniq } from 'lodash';
import { useCallback, useMemo } from 'react';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getProducersByNameAndCarrier } from '@deps/queries/api/v1/producers';
import {
    getProducersByIdQuery,
    getProducersByNameAndCarrierCodeQuery,
    getUserDownlineBySellingCode,
    getUserHierarchyBySellingCode,
} from '@deps/queries/tanstack/producerQueries/producerQueries';
import {
    GetDownlineResponse,
    GetHierarchyResponse,
    MAIN_AGENCY_ROLE,
    ProducersResponse,
    Upline,
    UplineItem,
} from '@deps/types/producers';

import {
    getSellingCodesFromAliases,
    useAllAliasesWithSellingCode,
} from './user-identity';

interface CombinedQueryBaseResult {
    isFetching: boolean;
}

interface CombinedQueryPendingResult extends CombinedQueryBaseResult {
    data: undefined;
    isPending: true;
    hasError: false;
    isLoading: boolean;
    errors: undefined;
}
interface CombinedQueryResultWithErrors<T> extends CombinedQueryBaseResult {
    data: T;
    isPending: false;
    hasError: true;
    isLoading: false;
    errors: (Error | null)[];
}

interface CombinedQuerySuccessResult<T> extends CombinedQueryBaseResult {
    data: T;
    isPending: false;
    hasError: false;
    isLoading: false;
    errors: null;
}

type CombinedQueryResult<T> =
    | CombinedQueryPendingResult
    | CombinedQueryResultWithErrors<T>
    | CombinedQuerySuccessResult<T>;

const getQueryResultsMeta = <T>(results: UseQueryResult<T>[]) => ({
    isPending: results.some((result) => result.isPending),
    hasError: results.some((result) => result.isError),
    isFetching: results.some((result) => result.isFetching),
    errors: results.map((result) => result.error),
});

const wrapCombinedQueryResultsData = <T, MT>(
    queryResults: UseQueryResult<T>[],
    combine: (results: UseQueryResult<T>[]) => MT
): CombinedQueryResult<MT> => {
    const { isPending, hasError, isFetching, errors } =
        getQueryResultsMeta<T>(queryResults);

    if (isPending) {
        return {
            data: undefined,
            isFetching,
            isPending: true,
            isLoading: isFetching,
            hasError: false,
            errors: undefined,
        };
    }

    const data = combine(queryResults);

    if (hasError && !isPending) {
        return {
            data,
            isFetching,
            isPending,
            isLoading: false,
            hasError,
            errors,
        };
    }

    return {
        data,
        isFetching,
        isPending: false,
        isLoading: false,
        hasError: false,
        errors: null,
    };
};

export const mapCombinedQueryResult = <T, MT>(
    mapperFn: (result: T) => MT,
    combinedResults: CombinedQueryResult<T>
): CombinedQueryResult<MT> => {
    const { isPending } = combinedResults;
    if (isPending) {
        return combinedResults;
    }

    return {
        ...combinedResults,
        data: mapperFn(combinedResults.data),
    };
};

export const POM_QUERY_PREFIXES = {
    GET_HIERARCHY_BY_SELLING_CODE: ['POM', 'hierarchyBySellingCode'],
    GET_DOWNLINE_BY_SELLING_CODE: ['POM', 'downlineBySellingCode'],
    GET_PRODUCERS_BY_NAME_AND_CARRIER: [
        'POM',
        'getProducersByNameAndCarrierCode',
    ],
    GET_PRODUCER_BY_ID: ['POM', 'getProducerById'],
} as const;

//
// Hierarchy
//

const buildHierarchyQueryOptions = (sellingCode: string | undefined) =>
    queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_HIERARCHY_BY_SELLING_CODE,
            sellingCode,
        ],
        queryFn: () => getUserHierarchyBySellingCode(sellingCode!),
        enabled: !!sellingCode,
        staleTime: 60 * 1_000 * 5,
    });

export const useHierarchyListQuery = <MT>(
    sellingCodes: string[],
    combine: (results: UseQueryResult<GetHierarchyResponse | null>[]) => MT
) =>
    useQueries({
        queries: uniq(sellingCodes).map((sellingCode) =>
            buildHierarchyQueryOptions(sellingCode)
        ),
        combine: useCallback(
            (results: UseQueryResult<GetHierarchyResponse | null>[]) =>
                wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });

//
// Downline
//

const buildDownlineQueryOptions = (
    sellingCode: string | undefined,
    partialFullName: string | undefined
) =>
    queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_DOWNLINE_BY_SELLING_CODE,
            { sellingCode, partialFullName },
        ],
        queryFn: () =>
            getUserDownlineBySellingCode(sellingCode!, partialFullName),
        enabled: !!(sellingCode && partialFullName != null),
        staleTime: 60 * 1_000 * 5,
    });

export const useDownlineListQuery = <MT>(
    sellingCodes: string[],
    partialFullName = '',
    combine: (results: UseQueryResult<GetDownlineResponse[][] | null>[]) => MT
) =>
    useQueries({
        queries: uniq(sellingCodes).map((sellingCode) =>
            buildDownlineQueryOptions(sellingCode, partialFullName)
        ),
        combine: useCallback(
            (results: UseQueryResult<GetDownlineResponse[][] | null>[]) =>
                wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });

//
// Producers
//

const buildGetProducersQueryOptions = (
    carrierCode: string | undefined,
    partialFullName: string
) => {
    const upperCarriercode = carrierCode?.toUpperCase();

    return queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_PRODUCERS_BY_NAME_AND_CARRIER,
            { partialFullName, upperCarriercode },
        ],
        queryFn: () =>
            getProducersByNameAndCarrierCodeQuery(
                partialFullName!,
                upperCarriercode!
            ),
        enabled: !!(partialFullName && carrierCode),
        staleTime: 60 * 1_000 * 5,
    });
};

export const useGetProducersListQuery = <MT>(
    carrierCodes: string[],
    partialFullName: string,
    combine: (results: UseQueryResult<ProducersResponse>[]) => MT
) =>
    useQueries({
        queries: uniq(carrierCodes).map((carrierCode) =>
            buildGetProducersQueryOptions(carrierCode, partialFullName)
        ),
        combine: useCallback(
            (results: UseQueryResult<ProducersResponse>[]) =>
                wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });

//
// Producer by Id
//

const buildGetProducerByIdQueryOptions = (lookupId: string | undefined) =>
    queryOptions({
        queryKey: [...POM_QUERY_PREFIXES.GET_PRODUCER_BY_ID, lookupId],
        queryFn: () => getProducersByIdQuery(lookupId!),
        enabled: !!lookupId,
    });

export const useGetProducerById = (lookupId: string | undefined) =>
    useQuery(buildGetProducerByIdQueryOptions(lookupId));

//
// Helpers
//

export const useAuthenticatedAgentSellingCodes = () => {
    const { partyReferenceData } = usePermissionsContext();

    const aliases = useAllAliasesWithSellingCode(partyReferenceData);

    return useMemo(() => getSellingCodesFromAliases(aliases), [aliases]);
};

export const isAgency = (uplineItem: UplineItem | null) =>
    uplineItem?.role === MAIN_AGENCY_ROLE;

/*
 * Returns the agencies from an upline that are at the lowest level available
 * In practice, there should be at most 1 agency at every level and
 * this should return at most 1 agency
 */
export const getNearestAgenciesFromUpline = (upline: Upline | null) => {
    const agencies = upline?.filter(isAgency) ?? [];

    if (!agencies.length) {
        return [];
    }

    const sortedAgencies = sortBy(agencies, 'level');
    const groupedAgencies = groupBy(sortedAgencies, 'level');

    const nearestHierarchyLevel = first(sortedAgencies)!.level;

    if (!nearestHierarchyLevel) {
        return [];
    }

    return groupedAgencies[nearestHierarchyLevel] ?? [];
};

/**
 * Returns the agencies that an agent belongs to
 * that are at the nearest level in each of their uplines
 */
export const useAuthenticatedAgentAgencies = () => {
    const agentSellingCodes = useAuthenticatedAgentSellingCodes();

    return useHierarchyListQuery(
        agentSellingCodes,
        useCallback(
            (results: UseQueryResult<GetHierarchyResponse | null>[]) => {
                const hierarchies = results
                    .map((result) => result?.data)
                    .filter((item): item is GetHierarchyResponse => !!item);

                const rootAgencyHierarchies = hierarchies.filter(
                    ({ role }) => role === MAIN_AGENCY_ROLE
                );

                if (rootAgencyHierarchies?.length) {
                    // Return all rootAgencies if any is present
                    return rootAgencyHierarchies.map((rootAgencyHierarchy) => ({
                        agencies: [rootAgencyHierarchy],
                        agentSellingCode: rootAgencyHierarchy?.sellingCode,
                    }));
                }

                return hierarchies
                    .map(
                        (hierarchy) =>
                            hierarchy && {
                                agencies: getNearestAgenciesFromUpline(
                                    hierarchy.upline ?? []
                                ),
                                agentSellingCode: hierarchy!.sellingCode,
                            }
                    )
                    .filter((item) => item!.agencies.length);
            },
            []
        )
    ) as CombinedQueryResult<
        {
            agencies: UplineItem[];
            agentSellingCode: string;
        }[]
    >;
};
