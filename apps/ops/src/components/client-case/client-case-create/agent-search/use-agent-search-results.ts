import { UseQueryResult } from '@tanstack/react-query';
import { first, groupBy, uniq } from 'lodash';

import { useAuthenticatedAgentSellingCodes } from '@deps/components/illustrations/helpers/hooks/pom';
import { useDelegatedAgentsBySellingCodeListQuery } from '@deps/components/illustrations/helpers/queries/agent-search/agents-by-selling-code-query';
import { DelegatedAgent } from '@deps/components/illustrations/helpers/queries/agent-search/types';
import { buildAgentOptionFromDelegatedAgent } from 'components/client-case/client-case-create/create-client-case-form/build-agent-option-from-delegated-agent';

import { AgentOption } from './types';

const deduplicateDelegatedAgents = (
    agents: DelegatedAgent[]
): DelegatedAgent[] => {
    const agentsByNpn = groupBy(agents, 'npn');

    const simplifiedAgents = Object.values(agentsByNpn).map((agentGroup) => ({
        ...first(agentGroup)!,
        sellingCodes: uniq(
            agentGroup.flatMap(({ sellingCodes }) => sellingCodes)
        ),
    }));

    return simplifiedAgents;
};

const delegatedAgentsCombinator = (
    results: UseQueryResult<(DelegatedAgent | null)[]>[]
): AgentOption[] => {
    const filteredDelegatedAgents = results
        ?.flatMap(({ data }) => data)
        // filter null values
        .filter((agent): agent is NonNullable<typeof agent> => agent != null)
        // Filter agent options with incomplete data
        .filter(
            ({ firstName, lastName, email }) => firstName && lastName && email
        );

    return (
        deduplicateDelegatedAgents(filteredDelegatedAgents)
            // Map DelegatedAgent[] to agentOption[]
            .map(buildAgentOptionFromDelegatedAgent)
    );
};

export const useAgentSearchResults = (partialFullName: string | undefined) => {
    const agentSellingCodes = useAuthenticatedAgentSellingCodes();

    return useDelegatedAgentsBySellingCodeListQuery(agentSellingCodes, {
        partialFullName,
        combine: delegatedAgentsCombinator,
    });
};
