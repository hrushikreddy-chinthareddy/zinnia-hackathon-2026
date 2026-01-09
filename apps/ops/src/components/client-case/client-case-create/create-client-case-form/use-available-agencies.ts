import { useAgencyOptions } from '@deps/components/illustrations/helpers/hooks/use-agency-options';
import { useLegacyAgencyOptions } from '@deps/components/illustrations/helpers/hooks/use-legacy-agency-options';
import { useAllAliasesWithSellingCode } from '@deps/components/illustrations/helpers/hooks/user-identity';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { AgentOption } from 'components/client-case/client-case-create/agent-search/types';

export const useAvailableAgencies = (agent: AgentOption | undefined) => {
    const { featureFlags } = useOptimizely();
    const improvedAgentSearchEnabled =
        featureFlags[FEATURE_FLAGS.ILLUSTRATIONS_IMPROVED_AGENT_SEARCH];

    const { partyReferenceData } = usePermissionsContext();

    const aliasesWithSellingCodes =
        useAllAliasesWithSellingCode(partyReferenceData);

    const agencies = useAgencyOptions(agent, aliasesWithSellingCodes);

    const legacyAgencies = useLegacyAgencyOptions(
        agent,
        aliasesWithSellingCodes
    );

    if (improvedAgentSearchEnabled) {
        return agencies;
    }

    return legacyAgencies;
};
