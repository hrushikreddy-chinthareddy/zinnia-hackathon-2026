import {
    QueryObserverSuccessResult,
    queryOptions,
    skipToken,
    useQueries,
    UseQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { AGENT_SEARCH_QUERY_PREFIXES } from 'components/illustrations/helpers/queries/agent-search/constants';

import { buildHierarchyQueryOptions, getHierarchyAgency } from './pom';
import { useAllAliasesWithSellingCode } from './user-identity';

const buildSelfAssignAgentQuery = ({
    sellingCode,
    carrierShortName,
}: {
    sellingCode: string;
    carrierShortName: string;
}) =>
    queryOptions({
        queryKey: [
            ...AGENT_SEARCH_QUERY_PREFIXES.SELF_ASSIGN,
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

                  const agency = getHierarchyAgency(hierarchy);

                  if (!agency) {
                      return null;
                  }

                  return {
                      lookupId: hierarchy.producerLookupId,
                      sellingCode,
                      carrierShortName,
                  };
              },
    });

export const useDefaultSelfAssignAgentSellingCode = () => {
    const { partyReferenceData } = usePermissionsContext();

    const aliasesWithSellingCodes =
        useAllAliasesWithSellingCode(partyReferenceData);

    const sellingCodes = aliasesWithSellingCodes?.map((alias) => ({
        sellingCode: alias.externalPartyIds?.find(
            (id) => id.key === 'SELLING_CODE'
        )?.value as string,
        carrierShortName: alias.carrier,
    }));

    return useQueries({
        queries:
            sellingCodes?.map((sellingCode) =>
                buildSelfAssignAgentQuery(sellingCode)
            ) ?? [],
        combine: useCallback(
            (
                results: UseQueryResult<{
                    lookupId: string;
                    sellingCode: string;
                    carrierShortName: string;
                } | null>[]
            ) => {
                const validResult = results.find(
                    (
                        result
                    ): result is QueryObserverSuccessResult<{
                        lookupId: string;
                        sellingCode: string;
                        carrierShortName: string;
                    }> => result.data != null && !result.isPlaceholderData
                );

                if (!validResult) {
                    return null;
                }

                return validResult.data;
            },
            []
        ),
    });
};
