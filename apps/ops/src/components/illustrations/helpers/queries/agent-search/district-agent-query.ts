import { QueryClient, queryOptions, skipToken } from '@tanstack/react-query';

import { PRODUCER_ROLES } from '@deps/types/producers';

import { AGENT_SEARCH_QUERY_PREFIXES } from './constants';
import { buildAgentsFromDownline } from './helpers';
import { buildGetDownlineForNearestRoleQueryOptions } from '../../hooks/pom';

const buildDistrictAgentQuery = ({
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
            ...AGENT_SEARCH_QUERY_PREFIXES.FOR_DISTRICT,
            carrierShortName,
            sellingCode,
            { partialFullName },
        ],
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  const districtManagerDownline = await client.fetchQuery(
                      buildGetDownlineForNearestRoleQueryOptions({
                          sellingCode,
                          role: PRODUCER_ROLES.BROKER_DEALER,
                          carrierShortName,
                          partialFullName,
                      })
                  );

                  if (!districtManagerDownline) {
                      return [];
                  }

                  return buildAgentsFromDownline(districtManagerDownline, {
                      carrierShortName,
                  });
              },
    });

export const fetchDistrictAgents = (
    client: QueryClient,
    {
        sellingCode,
        carrierShortName,
        partialFullName = '',
    }: {
        sellingCode: string;
        carrierShortName: string;
        partialFullName: string | undefined;
    }
) =>
    client.fetchQuery(
        buildDistrictAgentQuery({
            sellingCode,
            carrierShortName,
            partialFullName,
        })
    );
