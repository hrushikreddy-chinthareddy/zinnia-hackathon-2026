import { queryOptions, skipToken } from '@tanstack/react-query';

import { fetchAgencyAgents } from '../agency-agents-query';
import { fetchSelfAssignAgent } from '../agent-from-producer-query';
import { AGENT_SEARCH_QUERY_PREFIXES } from '../constants';

export const buildQueryForAgent = ({
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
            ...AGENT_SEARCH_QUERY_PREFIXES.FOR_AGENT,
            carrierShortName,
            sellingCode,
            { partialFullName },
        ],
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  const selfAssignAgentP = fetchSelfAssignAgent(client, {
                      sellingCode,
                      carrierShortName,
                      partialFullName,
                  });
                  const agencyAgentsP = await fetchAgencyAgents(client, {
                      sellingCode,
                      carrierShortName,
                      partialFullName,
                  });

                  const [selfAssignAgent, agencyAgents] = await Promise.all([
                      selfAssignAgentP,
                      agencyAgentsP,
                  ]);

                  return [selfAssignAgent, ...agencyAgents];
              },
    });
