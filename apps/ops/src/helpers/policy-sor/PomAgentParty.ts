import { PomAgentData } from '@deps/types/agents';
import {
    AddressType,
    Country,
    EmailType,
    Identification,
    Parties,
    State,
} from '@zinnia/api-types/types/sor';

import { PolicyParty } from './Parties';

export const transformPomAgentDataToParty = (
    // TODO: replace PomAgentData type with POM_Producer_Models_SearchProducersResult
    agentData: PomAgentData | undefined,
    partyData: Parties
): Parties & { producerName?: string; producerType?: string } => {
    // Filter out SSN from partyData if agent has one (agent data takes precedence)
    // This prevents duplicate SSN when both policy and agent data have SSN
    const filteredPartyIdentifications =
        partyData?.identifications?.filter((id) => {
            if (
                agentData?.socialSecurityNumber &&
                id.identificationType === Identification.identificationType.SSN
            ) {
                return false;
            }
            return true;
        }) ?? [];

    const party: Parties & { producerName?: string; producerType?: string } = {
        ...partyData,
        firstName: agentData?.firstName,
        lastName: agentData?.lastName,
        middleName: agentData?.middleName,
        producerName: agentData?.producerName,
        producerType: agentData?.producerType,
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
            ...(agentData?.socialSecurityNumber
                ? [
                      {
                          identificationType:
                              Identification.identificationType.SSN,
                          identificationValue: agentData.socialSecurityNumber,
                      },
                  ]
                : []),
            ...filteredPartyIdentifications,
        ],
    };
    return party;
};

export default class PomAgentParty extends PolicyParty {
    public get isAgent(): boolean {
        return true;
    }
    public businessName: string | undefined;
    public channel: string | undefined;

    constructor(agent: PomAgentData | undefined, party: Parties = {}) {
        super(transformPomAgentDataToParty(agent, party));
    }
}
