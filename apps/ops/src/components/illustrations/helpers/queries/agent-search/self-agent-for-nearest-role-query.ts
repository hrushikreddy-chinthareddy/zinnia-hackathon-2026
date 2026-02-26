import { QueryClient } from '@tanstack/react-query';

import { ProducerRole } from '@deps/types/producers';

import { buildAgentFromProducer, hasPartialFullName } from './helpers';
import { buildGetProducerForNearestRoleQuery } from '../../hooks/pom';

/**
 * Returns an agent for the nearest producer with an specific role
 */
export const fetchSelfAgentForNearestRole = async (
    client: QueryClient,
    {
        sellingCode,
        carrierShortName,
        role,
        partialFullName = '',
    }: {
        sellingCode: string;
        carrierShortName: string;
        role: ProducerRole;
        partialFullName: string | undefined;
    }
) => {
    const producer = await client.fetchQuery(
        buildGetProducerForNearestRoleQuery({
            sellingCode,
            role,
            carrierShortName,
        })
    );

    if (!producer) {
        return null;
    }

    const agent = buildAgentFromProducer(producer, {
        sellingCode,
        carrierShortName,
    });

    if (!agent || !hasPartialFullName(partialFullName, agent)) {
        return null;
    }

    return agent;
};
