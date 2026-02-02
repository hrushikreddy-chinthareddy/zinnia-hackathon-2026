import { QueryClient, queryOptions, skipToken } from '@tanstack/react-query';

import { PRODUCER_ROLES } from '@deps/types/producers';

import { fetchAgentsForNearestRoleDownline } from './agents-for-nearest-role-downline-query';
import { AGENT_SEARCH_QUERY_PREFIXES } from './constants';
import { fetchSelfAgentForNearestRole } from './self-agent-for-nearest-role-query';

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
                  const agencyOwnerAgentP = fetchSelfAgentForNearestRole(
                      client,
                      {
                          sellingCode,
                          role: PRODUCER_ROLES.GENERAL_AGENCY,
                          carrierShortName,
                          partialFullName,
                      }
                  );
                  const agencyAgentsP = fetchAgentsForNearestRoleDownline(
                      client,
                      {
                          sellingCode,
                          role: PRODUCER_ROLES.GENERAL_AGENCY,
                          carrierShortName,
                          partialFullName,
                      }
                  );

                  const [agencyOwnerAgent, agencyAgents] = await Promise.all([
                      agencyOwnerAgentP,
                      agencyAgentsP,
                  ]);

                  return [agencyOwnerAgent, ...agencyAgents];
              },
    });

export const fetchAgencyAgents = (
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
        buildAgencyAgentsQuery({
            sellingCode,
            carrierShortName,
            partialFullName,
        })
    );
