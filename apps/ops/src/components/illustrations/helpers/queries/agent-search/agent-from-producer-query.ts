import { QueryClient, queryOptions, skipToken } from '@tanstack/react-query';

import { buildGetProducerBySellingCodeQueryOptions } from 'components/illustrations/helpers/hooks/pom';

import { AGENT_SEARCH_QUERY_PREFIXES } from './constants';
import { buildAgentsFromProducer, hasPartialFullName } from './helpers';

/*
 * Query Options to fetch a single AgentOption for a sellingCode
 */
const buildAgentFromProducerQuery = ({
    sellingCode,
    carrierShortName,
}: {
    sellingCode: string | undefined;
    carrierShortName: string | undefined;
}) =>
    queryOptions({
        queryKey: [
            ...AGENT_SEARCH_QUERY_PREFIXES.FOR_SINGLE_PRODUCER,
            carrierShortName,
            sellingCode,
        ],
        queryFn: !(sellingCode && carrierShortName)
            ? skipToken
            : async ({ client }) => {
                  const producer = await client.fetchQuery(
                      buildGetProducerBySellingCodeQueryOptions({
                          sellingCode,
                          carrierShortName,
                      })
                  );

                  if (!producer) {
                      return null;
                  }

                  return buildAgentsFromProducer(producer, {
                      sellingCode,
                      carrierShortName,
                  });
              },
    });

export const fetchSelfAssignAgent = async (
    client: QueryClient,
    {
        sellingCode,
        carrierShortName,
        partialFullName = '',
    }: {
        sellingCode: string | undefined;
        carrierShortName: string | undefined;
        partialFullName?: string;
    }
) => {
    const selfAssignAgent = await client.fetchQuery(
        buildAgentFromProducerQuery({
            sellingCode,
            carrierShortName,
        })
    );

    if (
        !selfAssignAgent ||
        !hasPartialFullName(partialFullName, selfAssignAgent)
    ) {
        return null;
    }

    return selfAssignAgent;
};
