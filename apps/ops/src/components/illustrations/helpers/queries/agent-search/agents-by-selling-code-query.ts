import {
    QueryClient,
    queryOptions,
    skipToken,
    useQueries,
    UseQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { wrapCombinedQueryResultsData } from '@deps/hooks/combined-query';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { buildQueryForAgencyOwner } from './by-role/build-query-for-agency-owner';
import { buildQueryForAgent } from './by-role/build-query-for-agent';
import { buildQueryForDistrictManager } from './by-role/build-query-for-district-manager';
import { buildQueryForDistrictStaff } from './by-role/build-query-for-district-staff';
import { AGENT_SEARCH_QUERY_PREFIXES } from './constants';
import { DelegatedAgent } from './types';
import {
    buildHierarchyQueryOptions,
    getIllustratorRoleFromHierarchy,
} from '../../hooks/pom';
import { IllustratorRole } from '../../hooks/user-identity';

const queryFactoryMap = {
    [IllustratorRole.DISTRICT_MANAGER]: buildQueryForDistrictManager,
    [IllustratorRole.DISTRICT_STAFF]: buildQueryForDistrictStaff,
    [IllustratorRole.AGENCY_OWNER]: buildQueryForAgencyOwner,
    [IllustratorRole.AGENCY_STAFF]: buildQueryForAgent,
    [IllustratorRole.AGENT]: buildQueryForAgent,
} satisfies Partial<Record<IllustratorRole, unknown>>;

const getUserRole = async (
    client: QueryClient,
    sellingCode: string,
    carrierShortName: string
) => {
    const hierarchy = await client.fetchQuery(
        buildHierarchyQueryOptions({
            sellingCode,
            carrierShortName,
        })
    );

    if (!hierarchy) {
        return IllustratorRole.NO_ROLE;
    }

    return getIllustratorRoleFromHierarchy(hierarchy);
};

export const buildDelegatedAgentsBySellingCodeQuery = ({
    sellingCode,
    carrierShortName,
    partialFullName = '',
    enabled,
}: {
    sellingCode: string | undefined;
    carrierShortName: string | undefined;
    partialFullName: string | undefined;
    enabled: boolean;
}) => {
    carrierShortName = carrierShortName?.toUpperCase();

    return queryOptions({
        queryKey: [
            ...AGENT_SEARCH_QUERY_PREFIXES.BY_SELLING_CODE,
            carrierShortName,
            sellingCode,
            { partialFullName },
        ],
        enabled,
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  const illustratorRole = await getUserRole(
                      client,
                      sellingCode,
                      carrierShortName
                  );

                  if (illustratorRole === IllustratorRole.NO_ROLE) {
                      return [];
                  }

                  const queryFactory = queryFactoryMap[illustratorRole];

                  return await client.fetchQuery(
                      queryFactory({
                          sellingCode,
                          carrierShortName,
                          partialFullName,
                      })
                  );
              },
    });
};

// TODO: Clean signature
export const useDelegatedAgentsBySellingCodeListQuery = <MT>(
    sellingCodes: { sellingCode: string; carrierShortName: string }[],
    {
        partialFullName = '',
        combine,
    }: {
        partialFullName?: string;
        combine: (results: UseQueryResult<(DelegatedAgent | null)[]>[]) => MT;
    }
) => {
    const { featureFlags } = useOptimizely();
    const isImprovedSearchEnabled =
        featureFlags[FEATURE_FLAGS.ILLUSTRATIONS_IMPROVED_AGENT_SEARCH];

    return useQueries({
        queries: sellingCodes.map(({ sellingCode, carrierShortName }) =>
            buildDelegatedAgentsBySellingCodeQuery({
                sellingCode,
                carrierShortName,
                partialFullName,
                enabled: isImprovedSearchEnabled,
            })
        ),
        combine: useCallback(
            (results: UseQueryResult<(DelegatedAgent | null)[]>[]) =>
                wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });
};
