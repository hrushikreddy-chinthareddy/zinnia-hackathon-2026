import {
    Address,
    AddressType,
    Country,
    Email,
    EmailType,
    Gender,
    IdentificationType,
    Party,
    Phone,
    Prefix,
    State,
    Suffix,
} from '@zinnia/api-types/types/sor';

import { AgentData } from '@deps/types/agents';

import { PolicyParty } from './Parties';

// unsure if this is the direction we want to head, or if we should treat this as a separate class.
// My assumption is we'll want agent data to be used in a different way than policy party data, since we can't do things like update party information
export const transformAgentDataToParty = (agentData: AgentData | undefined, partyData: Party): Party => {
    // BPB - taking the first agent in the individuals array for now
    const firstAgent = agentData?.individuals?.[0];

    const taxIds =
        partyData?.identifications?.filter(
            id => id.identificationType === IdentificationType.SSN || id.identificationType === IdentificationType.TIN
        ) ?? [];

    const alreadyHasTheSameTaxId = taxIds.find(id => id.identificationValue === (agentData?.taxId || firstAgent?.taxId));

    const party: Party = {
        ...partyData,
        addresses: (agentData?.addresses ?? []).map((address: AgentData['addresses'][number]): Address => {
            return {
                addressLine1: address.addressLine1 || undefined,
                addressLine2: address.addressLine2 || undefined,
                addressLine3: address.addressLine3 || undefined,
                city: address.city || undefined,
                country: (address.country as Country) || undefined, // BPB - this is wrong.  3-digit into a 2-digit, but meh.
                state: (address.stateCode as State) || undefined,
                zipCode: address.zip || undefined,
                addressId: address.id || undefined, // BPB - this won't work with anything policyDetails, since it's a different system
                addressType: (address.addressType as AddressType) || undefined,
            };
        }),
        // Add agent specific identifications to the identifications array if they don't already exist
        identifications: [
            ...(alreadyHasTheSameTaxId
                ? []
                : [
                      {
                          identificationType: IdentificationType.SSN,
                          identificationValue: agentData?.taxId || firstAgent?.taxId || undefined,
                      },
                  ]),
            ...(partyData.identifications ?? []),
        ],
        emails: (agentData?.emails ?? []).map((email: AgentData['emails'][number]): Email => {
            return {
                emailAddress: email.email || undefined,
                emailType: (email.emailType as EmailType) || undefined,
                emailId: email.id || undefined, // BPB - this won't work with anything policyDetails, since it's a different system
            };
        }),
        phones: (agentData?.phones ?? []).map((phone: AgentData['phones'][number]): Phone => {
            return {
                areaCode: phone.areaCode || undefined,
                countryCode: phone.countryCode || undefined,
                dialNumber: phone.number || undefined,
                phoneId: phone.id || undefined, // BPB - this won't work with anything policyDetails, since it's a different system
                phoneType: (phone.phoneType as Phone['phoneType']) || undefined,
                extension: phone.extension || undefined,
            };
        }),
        abbreviatedName: firstAgent?.shortName || undefined,
        dateOfBirth: firstAgent?.birthDate || undefined,
        doingBusinessAs: agentData?.organizationName || undefined,
        firstName: firstAgent?.firstName || undefined,
        fullName: firstAgent?.fullName || firstAgent?.businessName || undefined,
        middleName: firstAgent?.middleName || undefined,
        lastName: firstAgent?.lastName || undefined,
        gender: (firstAgent?.gender as Gender) || undefined,
        prefix: (firstAgent?.prefix as Prefix) || undefined,
        suffix: (firstAgent?.suffix as Suffix) || undefined,
    };
    return party;
};

export default class AgentParty extends PolicyParty {
    public get isAgent(): boolean {
        return true;
    }
    public businessName: string | undefined;
    public channel: string | undefined;

    constructor(agent: AgentData | undefined, party: Party = {}) {
        super(transformAgentDataToParty(agent, party));

        this.channel = agent?.hierarchy?.[0]?.channel;
        this.businessName = agent?.individuals?.[0]?.businessName || undefined;
        // to do - firm information might be another api call that needs to be added on here
    }
}
