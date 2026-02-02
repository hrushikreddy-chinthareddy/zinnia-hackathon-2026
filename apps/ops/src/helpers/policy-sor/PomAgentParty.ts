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
): Parties => {
    // Filter out SSN and NPN from partyData if agent has them (agent data takes precedence)
    // This prevents duplicate identifications when both sources have the same type
    const filteredPartyIdentifications =
        partyData?.identifications?.filter((id) => {
            // If agent has SSN, filter out any existing SSNs from partyData
            if (
                agentData?.socialSecurityNumber &&
                id.identificationType === Identification.identificationType.SSN
            ) {
                return false;
            }
            // If agent has NPN, filter out any existing NPNs from partyData
            if (
                agentData?.nationalProducerNumber &&
                id.identificationType ===
                    ('NPN' as Identification.identificationType)
            ) {
                return false;
            }
            return true;
        }) ?? [];

    const party: Parties = {
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
            // Add agent's SSN if available
            ...(agentData?.socialSecurityNumber
                ? [
                      {
                          identificationType:
                              Identification.identificationType.SSN,
                          identificationValue: agentData.socialSecurityNumber,
                      },
                  ]
                : []),
            // Add agent's NPN if available
            ...(agentData?.nationalProducerNumber
                ? [
                      {
                          // identificationType: IdentificationType.NPN, TODO: update to this instead of string when kong updates
                          identificationType:
                              'NPN' as Identification.identificationType,
                          identificationValue: agentData.nationalProducerNumber,
                      },
                  ]
                : []),
            // Add remaining identifications from partyData (SSN/NPN already filtered out if agent has them)
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
