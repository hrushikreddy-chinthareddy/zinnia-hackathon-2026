import { useDefaultSelfAssignAgentSellingCode } from '@deps/components/illustrations/helpers/hooks/use-default-self-assign-agent';
import {
    getMainIdentyfiers,
    useAllAliasesWithSellingCode,
} from '@deps/components/illustrations/helpers/hooks/user-identity';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { AgentOption } from 'components/client-case/client-case-create/agent-search/types';

export const useDefaultAuthenticatedAgentOption = () => {
    const { partyReferenceData } = usePermissionsContext();
    const aliasesWithSellingCodes =
        useAllAliasesWithSellingCode(partyReferenceData);
    const { mainAlias: loggedInUserMainAlias } = getMainIdentyfiers(
        aliasesWithSellingCodes
    );

    const agentSellingCode = useDefaultSelfAssignAgentSellingCode();

    if (!agentSellingCode) {
        return agentSellingCode;
    }

    const { sellingCode, carrierShortName, lookupId } = agentSellingCode;

    const agentOption = {
        firstName:
            loggedInUserMainAlias?.firstName || partyReferenceData?.firstName,
        lastName:
            loggedInUserMainAlias?.lastName || partyReferenceData?.lastName,
        email: loggedInUserMainAlias?.email || partyReferenceData?.email,
        lookupId,
        sellingCodes: [sellingCode],
        carrierShortName,
    } satisfies AgentOption;

    return agentOption;
};
