import { useQuery } from '@tanstack/react-query';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { Processes, Statuses } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';

export function useCasesQuery({
    policyNumber,
    process,
    requestSubType,
    enabled = true,
}: {
    policyNumber: string | undefined;
    process: Processes[];
    requestSubType?: Processes[];
    enabled?: boolean;
}) {
    const { featureFlags } = useOptimizely();

    const payload = {
        limit: 25,
        notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
        policyNumber,
        process,
        requestSubType,
    };

    return useQuery({
        queryKey: ['cases', payload, featureFlags],
        queryFn: () => getCases(payload, featureFlags),
        enabled: !!policyNumber && !!featureFlags && enabled,
    });
}

export function hasAnyCase(casesResponse: any): boolean {
    return Array.isArray(casesResponse?.data) && casesResponse.data.length > 0;
}
