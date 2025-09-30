import { useQuery } from '@tanstack/react-query';

import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkFreelookCancellation } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';

/**
 * Custom hook to check freelook cancellation eligibility for a policy.
 * @param planCode - Policy plan code
 * @param policyNumber - Policy number
 * @returns Query result with additional isEligibleFreelookCancellation field
 */
export function useFreelookCancellation(
    planCode?: string,
    policyNumber?: string
) {
    return useQuery({
        queryKey: ['checkFreelookCancellation', planCode, policyNumber],
        queryFn: () =>
            checkFreelookCancellation(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleFreelookCancellation:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
        enabled: !!planCode && !!policyNumber,
    });
}
