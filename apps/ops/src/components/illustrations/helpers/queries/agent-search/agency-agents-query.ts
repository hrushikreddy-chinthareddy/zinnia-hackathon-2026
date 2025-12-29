import { queryOptions, skipToken } from '@tanstack/react-query';

import { PRODUCER_ROLES } from '@deps/types/producers';

import { AGENT_SEARCH_QUERY_PREFIXES } from './constants';
import { buildAgentsFromDownline } from './helpers';
import { buildGetDownlineForNearestRoleQueryOptions } from '../../hooks/pom';

export const buildAgencyAgentsQuery = ({
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
            ...AGENT_SEARCH_QUERY_PREFIXES.FOR_AGENCY,
            carrierShortName,
            sellingCode,
            { partialFullName },
        ],
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  const agencyDownline = await client.fetchQuery(
                      buildGetDownlineForNearestRoleQueryOptions({
                          sellingCode,
                          role: PRODUCER_ROLES.GENERAL_AGENCY,
                          carrierShortName,
                          partialFullName,
                      })
                  );

                  if (!agencyDownline) {
                      return [];
                  }

                  return buildAgentsFromDownline(agencyDownline, {
                      carrierShortName,
                  });
              },
    });
