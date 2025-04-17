import { AliasModel, PartyReferenceDataModel } from '@zinnia/api-types/types/partyreference';

/**
 * Checks if there is a Wellabe agent in the party reference data
 * @param partyRefData The party reference data
 * @returns A boolean indicating whether there is a Wellabe agent
 */
export const isWellabeAgent = (partyRefData: PartyReferenceDataModel): boolean => {
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
export const findCarrierAgents = (partyRefData: PartyReferenceDataModel, carrier: string): AliasModel[] => {
    const agents =
        partyRefData.alias?.filter(v => {
            return v.carrier?.toLowerCase() === carrier.toLowerCase() && v.partyRoles?.includes('PRIMARYSERVICINGAGENT');
        }) || [];

    return agents;
};
