import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getPomAgentData } from '@deps/queries/api/agents';
import { AGENT_ROLES } from '@deps/types/constants';
import { Parties, Policy } from '@zinnia/api-types/types/sor';

/**
 * Prefetches POM agent data for all agent parties on a policy.
 * Fires as soon as the policy resolves so the data is cached
 * before the user navigates to the People tab.
 *
 * Query keys match PeopleSubPage's useQueries exactly.
 */
export const usePrefetchAgentData = (policy: Policy | undefined) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (
            !policy?.parties ||
            !policy?.partyRoles ||
            !policy?.policyNumber ||
            !policy?.product?.planCode
        )
            return;

        const agentPartyIds = new Set(
            policy.partyRoles
                .filter((pr) => AGENT_ROLES.includes(pr.partyRole as string))
                .map((pr) => pr.partyId)
        );

        const agentParties = policy.parties.filter(
            (p: Parties) => agentPartyIds.has(p.partyId) && p.agentExternalId
        );

        agentParties.forEach((party: Parties) => {
            queryClient.prefetchQuery({
                queryKey: [
                    'agentData',
                    party.agentExternalId,
                    policy.carrierId,
                    policy.policyNumber,
                    policy.product?.planCode,
                    party.partyId,
                ],
                queryFn: () =>
                    getPomAgentData({
                        id: party.agentExternalId,
                        policyNumber: policy.policyNumber,
                        planCode: policy.product?.planCode,
                    }),
            });
        });
    }, [policy, queryClient]);
};
