import { useQueries, UseQueryResult } from '@tanstack/react-query';

import { useAllAliasesWithSellingCode } from '@deps/components/illustrations/helpers/hooks/user-identity';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getUserDownlineBySellingCode } from '@deps/queries/tanstack/producerQueries/producerQueries';
import { GetDownlineResponse } from '@deps/types/producers';

const combineDownlineList = (
    results: UseQueryResult<GetDownlineResponse[][] | null>[]
) => ({
    data: results
        .map((result) => {
            return result.data ?? undefined;
        })
        .flat(),
    isFetching: results.some((result) => result.isFetching),
    hasError: results.some((result) => result.isError),
});

export const useDownlineListQuery = (
    sellingCodes: string[],
    partialFullName = ''
) =>
    useQueries({
        queries: sellingCodes.map((sellingCode) => ({
            queryKey: ['agentDownline', sellingCode],
            queryFn: () =>
                getUserDownlineBySellingCode(sellingCode, partialFullName),
            enabled: !!sellingCode,
        })),
        combine: combineDownlineList,
    });
