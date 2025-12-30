import { queryOptions, skipToken } from '@tanstack/react-query';

import { AGENT_SEARCH_QUERY_PREFIXES } from './constants';
import { buildAgentsFromProducer } from './helpers';
import { buildGetProducerBySellingCodeQueryOptions } from '../../hooks/pom';

/*
 * Query Options to fetch a single AgentOption for a sellingCode
 */
export const buildAgentFromProducerQuery = ({
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
