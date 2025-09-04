import {
    AliasModel,
    PartyReferenceDataModel,
} from '@zinnia/api-types/types/partyreference';

import { PartyRole } from '@deps/models/policy/sor-policy';

/**
 * Checks if there is a Wellabe agent in the party reference data
 * @param partyRefData The party reference data
 * @returns A boolean indicating whether there is a Wellabe agent
 */
export const isWellabeAgent = (
    partyRefData: PartyReferenceDataModel
): boolean => {
    const wellabeAgent = findCarrierAgents(partyRefData, 'welb');

    // Return true if there is at least one Wellabe agent
    return wellabeAgent?.length > 0;
};

/**
 * Finds the agents for a given carrier in the party reference data
 * @param partyRefData The party reference data
 * @param carrier The carrier to find the agents for
 * @returns An array of aliases that represent the agents for the given carrier
 */
export const findCarrierAgents = (
    partyRefData: PartyReferenceDataModel,
    carrier: string
): AliasModel[] => {
    const agents =
        partyRefData.alias?.filter((v) => {
            return (
                v.carrier?.toLowerCase() === carrier.toLowerCase() &&
                v.partyRoles?.includes(PartyRole.PRIMARYSERVICINGAGENT)
            );
        }) || [];

    return agents;
};

export const findCarrierAlias = (
    partyRefData: PartyReferenceDataModel,
    carrier: string
): AliasModel[] => {
    const agents =
        partyRefData.alias?.filter((v) => {
            return v.carrier?.toLowerCase() === carrier.toLowerCase();
        }) || [];

    return agents;
};

export const getMasterAgentNumber = (
    partyRefData?: PartyReferenceDataModel
) => {
    const alias = partyRefData?.alias?.find((v) =>
        v.partyRoles?.includes(PartyRole.PRIMARYSERVICINGAGENT)
    );

    return alias?.masterAgentNumber;
};

export const getExternalAgentId = (partyRefData?: PartyReferenceDataModel) => {
    const alias = partyRefData?.alias?.find((v) =>
        v.partyRoles?.includes(PartyRole.PRIMARYSERVICINGAGENT)
    );

    return alias?.externalId;
};
