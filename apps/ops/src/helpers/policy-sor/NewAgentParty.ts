import {
    AddressType,
    Country,
    EmailType,
    IdentificationType,
    Party,
    State,
} from '@xd/api-types/dist/generated-types/sor';

import { PomAgentData } from '@deps/types/agents';

import { PolicyParty } from './Parties';

export const transformPomAgentDataToParty = (
    // TODO: replace PomAgentData type with POM_Producer_Models_SearchProducersResult
    agentData: PomAgentData | undefined,
    partyData: Party
): Party => {
    const party: Party = {
        ...partyData,
        firstName: agentData?.firstName,
        lastName: agentData?.lastName,
        middleName: agentData?.middleName,
        addresses: [
            {
                addressLine1: agentData?.businessAddress.line || undefined,
                addressLine2: agentData?.businessAddress.line2 || undefined,
                city: agentData?.businessAddress.city || undefined,
                country:
                    (agentData?.businessAddress.country as Country) ||
                    undefined,
                state: (agentData?.businessAddress.state as State) || undefined,
                zipCode: agentData?.businessAddress.zipCode || undefined,
                addressId: agentData?.businessAddress.id || undefined,
                addressType:
                    (agentData?.businessAddress.type as AddressType) ||
                    undefined,
            },
        ],
        phones: [
            {
                phoneType: agentData?.businessPhone.type || undefined,
                countryCode: agentData?.businessPhone.countryCode || undefined,
                dialNumber: agentData?.businessPhone.number || undefined,
                extension: agentData?.businessPhone.extension || undefined,
            },
        ],
        emails: [
            {
                emailType: EmailType.BUSINESS,
                emailAddress: agentData?.email || undefined,
            },
        ],
        partyId: agentData?.partyId || undefined,
        identifications: [
            {
                identificationType: IdentificationType.SSN,
                identificationValue:
                    agentData?.socialSecurityNumber || undefined,
            },
            {
                identificationType: IdentificationType.OTHER,
                identificationValue:
                    agentData?.nationalProducerNumber || undefined,
            },
        ],
    };
    return party;
};

export default class NewAgentParty extends PolicyParty {
    public get isAgent(): boolean {
        return true;
    }
    public businessName: string | undefined;
    public channel: string | undefined;

    constructor(agent: PomAgentData | undefined, party: Party = {}) {
        super(transformPomAgentDataToParty(agent, party));
    }
}
