import { queryOptions, skipToken } from '@tanstack/react-query';

import { AGENT_SEARCH_QUERY_PREFIXES } from '../constants';
import { buildDistrictAgentQuery } from '../district-agent-query';
import { DelegatedAgent } from '../types';

export const buildQueryForDistrictManager = ({
    sellingCode,
    carrierShortName,
    partialFullName = '',
}: {
    sellingCode: string | undefined;
    carrierShortName: string | undefined;
    partialFullName: string | undefined;
}) =>
    queryOptions({
        queryKey: [
            ...AGENT_SEARCH_QUERY_PREFIXES.FOR_DISTRICT_MANAGER,
            carrierShortName,
            sellingCode,
            { partialFullName },
        ],
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }): Promise<(DelegatedAgent | null)[]> => {
                  // District-agent (producer downline)
                  const agencyAgents = await client.fetchQuery(
                      buildDistrictAgentQuery({
                          sellingCode,
                          carrierShortName,
                          partialFullName,
                      })
                  );

                  return agencyAgents;
              },
    });
