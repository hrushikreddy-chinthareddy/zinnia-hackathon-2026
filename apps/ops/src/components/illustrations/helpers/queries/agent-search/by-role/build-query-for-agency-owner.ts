import { queryOptions, skipToken } from '@tanstack/react-query';

import { buildAgencyAgentsQuery } from '../agency-agents-query';
import { buildAgentFromProducerQuery } from '../agent-from-producer-query';
import { AGENT_SEARCH_QUERY_PREFIXES } from '../constants';
import { hasPartialFullName } from '../helpers';

export const buildQueryForAgencyOwner = ({
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
            ...AGENT_SEARCH_QUERY_PREFIXES.FOR_AGENCY_OWNER,
            carrierShortName,
            sellingCode,
            { partialFullName },
        ],
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  // Self-assign agent
                  const selfAssignAgentP = client.fetchQuery(
                      buildAgentFromProducerQuery({
                          sellingCode,
                          carrierShortName,
                      })
                  );
                  // Agency agents (producer downline)
                  const agencyAgents = await client.fetchQuery(
                      buildAgencyAgentsQuery({
                          sellingCode,
                          carrierShortName,
                          partialFullName,
                      })
                  );

                  const selfAssignAgent = await selfAssignAgentP;

                  return [
                      // Only include the self-assign agent if their name
                      // matches
                      selfAssignAgent &&
                      hasPartialFullName(partialFullName, selfAssignAgent)
                          ? selfAssignAgent
                          : null,
                      ...agencyAgents,
                  ];
              },
    });
