import {
    queryOptions,
    skipToken,
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
    PRODUCER_ROLES,
    ProducerRole,
    ProducersResponse,
    Upline,
    UplineItem,
} from '@deps/types/producers';

import {
    getSellingCodesFromAliases,
    IllustratorRole,
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
    GET_COMP_PRODUCER_BY_SELLING_CODE: [
        'POM',
        'comp',
        'getProducerBySellingcode',
    ],
    GET_COMP_DOWNLINE_FOR_NEAREST_ROLE: [
        'POM',
        'comp',
        'getdownlineForNearestRole',
    ],
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
        partialFullName = '',
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

const buildGetWrappedProducerByIdQueryOptions = (
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
        queryFn: () => getProducersByIdQuery(lookupId!, upperCarrierShortName!),
        enabled: !!(lookupId && carrierShortName),
    });
};

/**
 * @deprecated use `useGetProducerById` instead
 */
export const useGetWrappedProducerByIdQuery = (
    lookupId: string | undefined,
    carrierShortName: string | undefined
) =>
    useQuery(
        buildGetWrappedProducerByIdQueryOptions(lookupId, carrierShortName)
    );

export const useGetProducerByIdQuery = (
    lookupId: string | undefined,
    carrierShortName: string | undefined
) => useQuery(buildGetProducerByIdQueryOptions(lookupId, carrierShortName));

export const useGetWrappedProducersByIdListQuery = <MT>(
    params: { lookupId: string; carrierShortName: string }[],
    combine: (
        results: UseQueryResult<GetProducerByIdWrappedResponse | null>[]
    ) => MT
) =>
    useQueries({
        queries: params.map(({ lookupId, carrierShortName }) =>
            buildGetWrappedProducerByIdQueryOptions(lookupId, carrierShortName)
        ),
        combine: useCallback(
            (results: UseQueryResult<GetProducerByIdWrappedResponse>[]) =>
                wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });

//
// Composite queries
//

export const buildGetProducerBySellingCodeQueryOptions = ({
    sellingCode,
    carrierShortName,
}: {
    sellingCode: string | undefined;
    carrierShortName: string | undefined;
}) => {
    carrierShortName = carrierShortName?.toUpperCase();

    return queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_COMP_PRODUCER_BY_SELLING_CODE,
            carrierShortName,
            sellingCode,
        ],
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  const hierarchy = await client.fetchQuery(
                      buildHierarchyQueryOptions({
                          sellingCode,
                          carrierShortName,
                      })
                  );

                  if (!hierarchy) {
                      return null;
                  }

                  return await client.fetchQuery(
                      buildGetProducerByIdQueryOptions(
                          hierarchy?.producerLookupId,
                          carrierShortName
                      )
                  );
              },
    });
};

export const buildGetDownlineForNearestRoleQueryOptions = ({
    sellingCode,
    role,
    carrierShortName,
    partialFullName = '',
}: {
    sellingCode: string | undefined;
    role: ProducerRole | undefined;
    carrierShortName: string | undefined;
    partialFullName: string | undefined;
}) => {
    carrierShortName = carrierShortName?.toUpperCase();

    return queryOptions({
        queryKey: [
            ...POM_QUERY_PREFIXES.GET_COMP_DOWNLINE_FOR_NEAREST_ROLE,
            carrierShortName,
            sellingCode,
            role,
            { partialFullName },
        ],
        queryFn: !(sellingCode && role && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  const hierarchy = await client.fetchQuery(
                      buildHierarchyQueryOptions({
                          sellingCode,
                          carrierShortName,
                      })
                  );

                  if (!hierarchy) {
                      return null;
                  }

                  const nearestProducer = getNearestRoleFromHierarchy(
                      hierarchy,
                      role
                  );

                  if (!nearestProducer) {
                      return null;
                  }

                  return await client.fetchQuery(
                      buildDownlineQueryOptions(nearestProducer.sellingCode, {
                          carrierShortName,
                          partialFullName,
                      })
                  );
              },
    });
};

export const useGetProducersBySellingCodeListQuery = <MT>(
    params: { sellingCode: string; carrierShortName: string }[] | undefined,
    combine: (results: UseQueryResult<ApiGetProducerResponse | null>[]) => MT
) =>
    useQueries({
        queries:
            params?.map(({ sellingCode, carrierShortName }) =>
                buildGetProducerBySellingCodeQueryOptions({
                    sellingCode,
                    carrierShortName,
                })
            ) ?? [],
        combine: useCallback(
            (results: UseQueryResult<ApiGetProducerResponse | null>[]) =>
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

/**
 * Returns the nearest instance of an specific producer role in a hierarchy
 */
const getNearestRoleFromHierarchy = (
    hierarchy: GetHierarchyResponse | null,
    role: ProducerRole
) => {
    if (!hierarchy) {
        return null;
    }

    if (hierarchy.role === role) {
        return hierarchy;
    }

    const { upline } = hierarchy;
    const uplineItems =
        upline?.filter((uplineItem) => uplineItem.role === role) ?? [];

    if (!uplineItems.length) {
        return null;
    }

    const sortedItems = sortBy(uplineItems, 'level');

    return first(sortedItems)!;
};

/*
 * Returns the nearest agency from a hierarchy upline
 */
export const getHierarchyAgency = (hierarchy: GetHierarchyResponse | null) =>
    getNearestRoleFromHierarchy(hierarchy, PRODUCER_ROLES.GENERAL_AGENCY);

/*
 * Returns the nearest BrokerDealer from a hierarchy upline
 */
export const getHierarchyBrokerDealer = (
    hierarchy: GetHierarchyResponse | null
) => getNearestRoleFromHierarchy(hierarchy, PRODUCER_ROLES.BROKER_DEALER);

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
 *
 * Infers an illustrator role for an specific hierarchy
 */
export const getIllustratorRoleFromHierarchy = (
    hierarchy: GetHierarchyResponse
) => {
    const agency = getHierarchyAgency(hierarchy);
    const brokerDealer = getHierarchyBrokerDealer(hierarchy);

    const isDistrictManager = hierarchy.role === PRODUCER_ROLES.BROKER_DEALER;
    const isAgencyOwner = hierarchy.role === PRODUCER_ROLES.GENERAL_AGENCY;
    const isDistrictStaff =
        hierarchy.role === PRODUCER_ROLES.REP &&
        agency == null &&
        brokerDealer != null;
    const isNormalAgent =
        hierarchy.role === PRODUCER_ROLES.REP && agency != null;

    if (isDistrictManager) {
        return IllustratorRole.DISTRICT_MANAGER;
    }

    if (isDistrictStaff) {
        return IllustratorRole.DISTRICT_STAFF;
    }

    if (isAgencyOwner) {
        return IllustratorRole.AGENCY_OWNER;
    }

    if (isNormalAgent) {
        return IllustratorRole.AGENT;
    }

    return IllustratorRole.NO_ROLE;
};
