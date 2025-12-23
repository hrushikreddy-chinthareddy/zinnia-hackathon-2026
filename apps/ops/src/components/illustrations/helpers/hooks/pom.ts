import {
    queryOptions,
    useQueries,
    useQuery,
    UseQueryResult,
} from '@tanstack/react-query';
import { first, groupBy, sortBy } from 'lodash';
import { useCallback, useMemo } from 'react';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { wrapCombinedQueryResultsData } from '@deps/hooks/combined-query';
import {
    getProducersByIdQuery,
    getProducersByNameAndCarrierCodeQuery,
    getUserDownlineBySellingCode,
    getUserHierarchyBySellingCode,
} from '@deps/queries/tanstack/producerQueries/producerQueries';
import { ApiGetProducerResponse } from '@deps/types/pom/get.types';
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

export const buildHierarchyQueryOptions = ({
    sellingCode,
    carrierShortName,
}: {
    sellingCode?: string;
    carrierShortName?: string;
}) =>
    queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_HIERARCHY_BY_SELLING_CODE,
            { sellingCode, carrierShortName },
        ],
        queryFn: () =>
            getUserHierarchyBySellingCode(sellingCode!, {
                carrierShortName: carrierShortName!,
            }),
        enabled: !!(sellingCode && carrierShortName),
        staleTime: 60 * 1_000 * 5,
    });

export const useHierarchyListQuery = <MT>(
    params: { sellingCode: string; carrierShortName: string }[] | undefined,
    combine: (results: UseQueryResult<GetHierarchyResponse | null>[]) => MT
) =>
    useQueries({
        queries:
            params?.map(({ sellingCode, carrierShortName }) =>
                buildHierarchyQueryOptions({ sellingCode, carrierShortName })
            ) ?? [],
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
    {
        carrierShortName,
        partialFullName,
    }: {
        carrierShortName: string | undefined;
        partialFullName: string | undefined;
    }
) =>
    queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_DOWNLINE_BY_SELLING_CODE,
            { sellingCode, carrierShortName, partialFullName },
        ],
        queryFn: () =>
            getUserDownlineBySellingCode(sellingCode!, {
                carrierShortName: carrierShortName!,
                partialFullName,
            }),
        enabled: !!(sellingCode && carrierShortName),
        staleTime: 60 * 1_000 * 5,
    });

export const useDownlineListQuery = <MT>(
    params: { sellingCode: string; carrierShortName: string }[],
    {
        partialFullName = '',
        combine,
    }: {
        partialFullName?: string;
        combine: (
            results: UseQueryResult<GetDownlineResponse[][] | null>[]
        ) => MT;
    }
) =>
    useQueries({
        queries: params.map(({ sellingCode, carrierShortName }) =>
            buildDownlineQueryOptions(sellingCode, {
                carrierShortName,
                partialFullName,
            })
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

const buildGetProducersQueryOptions = ({
    carrierShortName,
    partialFullName,
}: {
    carrierShortName?: string;
    partialFullName: string;
}) => {
    const upperCarrierShortName = carrierShortName?.toUpperCase();

    return queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_PRODUCERS_BY_NAME_AND_CARRIER,
            upperCarrierShortName,
            { partialFullName },
        ],
        queryFn: () =>
            getProducersByNameAndCarrierCodeQuery(
                partialFullName!,
                upperCarrierShortName!
            ),
        enabled: !!(partialFullName && carrierShortName),
        staleTime: 60 * 1_000 * 5,
    });
};

export const useGetProducersListQuery = <MT>(
    carrierShortNames: string[],
    {
        partialFullName,
        combine,
    }: {
        partialFullName: string;
        combine: (results: UseQueryResult<ProducersResponse>[]) => MT;
    }
) =>
    useQueries({
        queries: carrierShortNames.map((carrierShortName) =>
            buildGetProducersQueryOptions({ carrierShortName, partialFullName })
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

export type GetProducerByIdWrappedResponse = {
    lookupId: string;
    carrierShortName: string;
    response: ApiGetProducerResponse | null;
};

const buildGetProducerByIdQueryOptions = (
    lookupId: string | undefined,
    carrierShortName: string | undefined
) => {
    const upperCarrierShortName = carrierShortName?.toUpperCase();

    return queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_PRODUCER_BY_ID,
            upperCarrierShortName,
            lookupId,
        ],
        queryFn: async (): Promise<GetProducerByIdWrappedResponse> => ({
            lookupId: lookupId!,
            carrierShortName: upperCarrierShortName!,
            response: await getProducersByIdQuery(
                lookupId!,
                upperCarrierShortName!
            ),
        }),
        enabled: !!(lookupId && carrierShortName),
    });
};

export const useGetProducerById = (
    lookupId: string | undefined,
    carrierShortName: string | undefined
) => useQuery(buildGetProducerByIdQueryOptions(lookupId, carrierShortName));

export const useGetProducersByIdListQuery = <MT>(
    params: { lookupId: string; carrierShortName: string }[],
    combine: (
        results: UseQueryResult<GetProducerByIdWrappedResponse | null>[]
    ) => MT
) =>
    useQueries({
        queries: params.map(({ lookupId, carrierShortName }) =>
            buildGetProducerByIdQueryOptions(lookupId, carrierShortName)
        ),
        combine: useCallback(
            (results: UseQueryResult<GetProducerByIdWrappedResponse>[]) =>
                wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });

//
// Helpers
//

export const useAuthenticatedAgentSellingCodes = () => {
    const { partyReferenceData } = usePermissionsContext();

    const aliases = useAllAliasesWithSellingCode(partyReferenceData);

    return useMemo(() => getSellingCodesFromAliases(aliases), [aliases]);
};

export const isAgency = (
    uplineItem: UplineItem | GetHierarchyResponse | null
) => uplineItem?.role === MAIN_AGENCY_ROLE;

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
