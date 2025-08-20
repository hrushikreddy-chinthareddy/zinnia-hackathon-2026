import { getPartyReferenceByPartyId } from '@deps/queries/api/server/v1/party-reference';
import { LoggingContext } from '@deps/utils/server-logging';

const AOR_IDENTIFIER_LABEL = 'AOR';
const UPN_IDENTIFIER_LABEL = 'UPN';
const SELLING_CODE_IDENTIFIER_LABEL = 'SELLING_CODE';
export const CLIENT_CASE_MANAGER_API_ORIGIN = 'client-case-manager-api';
export const getSellingcodeFromPartyReference = async (
    partyId: string,
    loggingContext: LoggingContext
) => {
    const partyReferenceResponse = await getPartyReferenceByPartyId(
        partyId,
        loggingContext
    );

    if (!partyReferenceResponse) {
        return null;
    }

    const { email, alias } = partyReferenceResponse;
    const agentAlias = alias.find((alias) => alias.email === email);

    if (!agentAlias) {
        return null;
    }

    const { externalPartyIds } = agentAlias;

    if (!externalPartyIds?.length) {
        return null;
    }

    const agentSellingCodeExternalParty = externalPartyIds.find(
        ({ key }) => key === SELLING_CODE_IDENTIFIER_LABEL
    );

    if (agentSellingCodeExternalParty) {
        return agentSellingCodeExternalParty.value;
    }

    const agentAORExternalParty = externalPartyIds.find(
        ({ key }) => key === AOR_IDENTIFIER_LABEL
    );

    const agentUPNExternalParty = externalPartyIds.find(
        ({ key }) => key === UPN_IDENTIFIER_LABEL
    );

    if (agentAORExternalParty?.value && agentUPNExternalParty?.value) {
        // For Farmers: AOR + UPN = SELLING_CODE
        return agentAORExternalParty.value + agentUPNExternalParty.value;
    }

    return null;
};
