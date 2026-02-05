import { PomAgentData } from '@deps/types/agents';
import {
    AddressType,
    Country,
    EmailType,
    IdentificationTypeEnum,
    Parties,
    State,
} from '@zinnia/api-types/types/sor';

import { PolicyParty } from './Parties';

export const transformPomAgentDataToParty = (
    // TODO: replace PomAgentData type with POM_Producer_Models_SearchProducersResult
    agentData: PomAgentData | undefined,
    partyData: Parties
): Parties & {
    producerType: string | undefined;
    producerName: string | undefined;
} => {
    const party: Parties & {
        producerType: string | undefined;
        producerName: string | undefined;
    } = {
        ...partyData,
        firstName: agentData?.firstName,
        lastName: agentData?.lastName,
        middleName: agentData?.middleName,
        producerType: agentData?.producerType,
        producerName: agentData?.producerName,
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
                identificationType: IdentificationTypeEnum.SSN,
                identificationValue:
                    agentData?.socialSecurityNumber || undefined,
            },
            {
                // identificationType: IdentificationType.NPN, TODO: update to this instead of string when kong updates
                identificationType: 'NPN' as IdentificationTypeEnum,
                identificationValue:
                    agentData?.nationalProducerNumber || undefined,
            },
            ...(partyData.identifications ?? []),
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
