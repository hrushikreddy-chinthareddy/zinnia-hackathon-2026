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
import { getSellingCodesFromAliases } from './user-identity';

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

export const useSelfAssignAgentSellingCodes = () => {
    const { partyReferenceData } = usePermissionsContext();

    const sellingCodes = getSellingCodesFromAliases(partyReferenceData?.alias);

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
                const validSelfAssignSellingCodes = results
                    .filter(
                        (
                            result
                        ): result is QueryObserverSuccessResult<{
                            lookupId: string;
                            sellingCode: string;
                            carrierShortName: string;
                        }> => result.data != null && !result.isPlaceholderData
                    )
                    .map((result) => result.data);

                return validSelfAssignSellingCodes;
            },
            []
        ),
    });
};
