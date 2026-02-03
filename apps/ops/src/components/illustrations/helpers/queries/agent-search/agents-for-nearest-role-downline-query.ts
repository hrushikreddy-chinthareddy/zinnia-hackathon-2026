import { QueryClient } from '@tanstack/react-query';

import { ProducerRole } from '@deps/types/producers';

import { buildAgentsFromDownline } from './helpers';
import { buildGetDownlineForNearestRoleQueryOptions } from '../../hooks/pom';

export const fetchAgentsForNearestRoleDownline = async (
    client: QueryClient,
    {
        sellingCode,
        role,
        carrierShortName,
        partialFullName = '',
    }: {
        sellingCode: string;
        role: ProducerRole;
        carrierShortName: string;
        partialFullName: string | undefined;
    }
) => {
    const nearestProducerDownline = await client.fetchQuery(
        buildGetDownlineForNearestRoleQueryOptions({
            sellingCode,
            role,
            carrierShortName,
            partialFullName,
        })
    );

    if (!nearestProducerDownline) {
        return [];
    }

    return buildAgentsFromDownline(nearestProducerDownline, {
        carrierShortName,
    });
};
