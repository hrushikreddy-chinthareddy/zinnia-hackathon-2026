import { UseQueryResult } from '@tanstack/react-query';
import { sortBy, uniqBy, zip } from 'lodash';
import { useCallback } from 'react';

import { useGetProducersListQuery } from '@deps/components/illustrations/helpers/hooks/pom';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import {
    PRODUCER_SEARCH_RESULT_TYPES,
    ProducersResponse,
} from '@deps/types/producers';

import { AgentOption } from './types';

export const useAgentSearchResultsForSuperIllustrator = (
    searchQuery: string
) => {
    const { writeClientCaseCarriers } = usePermissionsContext();

    return useGetProducersListQuery(writeClientCaseCarriers, {
        partialFullName: searchQuery,
        combine: useCallback(
            (results: UseQueryResult<ProducersResponse>[]) =>
                sortBy(
                    uniqBy(
                        zip(results, writeClientCaseCarriers)
                            .flatMap(
                                ([result, carrierShortName]) =>
                                    result?.data?.producers.map((producer) => ({
                                        ...producer,
                                        carrierShortName: carrierShortName!,
                                    })) ?? []
                            )
                            .filter(
                                (producer) =>
                                    producer.type ===
                                    PRODUCER_SEARCH_RESULT_TYPES.INDIVIDUAL
                            )
                            .map(
                                ({ lookupId, name, email, carrierShortName }) =>
                                    ({
                                        lookupId,
                                        firstName: name,
                                        email,
                                        carrierShortName,
                                        // This endpoint does not return any agent selling
                                        // code this is not a problem because we are gonna
                                        // request them later
                                        sellingCodes: [] as string[],
                                    } as AgentOption)
                            ),
                        'lookupId'
                    ),
                    'firstName'
                ),
            [writeClientCaseCarriers]
        ),
    });
};
