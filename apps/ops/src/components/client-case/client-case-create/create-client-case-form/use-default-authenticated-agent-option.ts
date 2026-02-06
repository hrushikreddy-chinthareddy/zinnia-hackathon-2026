import { useSelfAssignAgentSellingCodes } from '@deps/components/illustrations/helpers/hooks/use-self-assign-agent-selling-codes';
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

    const agentSellingCodes = useSelfAssignAgentSellingCodes();

    if (!agentSellingCodes.length) {
        return null;
    }

    const { carrierShortName, lookupId } = agentSellingCodes[0];

    const agentOption = {
        firstName:
            loggedInUserMainAlias?.firstName || partyReferenceData?.firstName,
        lastName:
            loggedInUserMainAlias?.lastName || partyReferenceData?.lastName,
        email: loggedInUserMainAlias?.email || partyReferenceData?.email,
        lookupId,
        sellingCodes: agentSellingCodes
            .filter(
                (agentSellingCode) =>
                    agentSellingCode.carrierShortName === carrierShortName
            )
            .map(({ sellingCode }) => sellingCode),
        carrierShortName,
    } satisfies AgentOption;

    return agentOption;
};
