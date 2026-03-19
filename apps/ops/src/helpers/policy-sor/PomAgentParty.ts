import { PomAgentData } from '@deps/types/agents';
import { ProducerType } from '@deps/types/pom';
import {
    AddressType,
    Country,
    EmailType,
    IdentificationTypeEnum,
    Parties,
    PartyType,
    State,
} from '@zinnia/api-types/types/sor';

import { PolicyParty } from './Parties';

export const transformPomAgentDataToParty = (
    // TODO: replace PomAgentData type with POM_Producer_Models_SearchProducersResult
    agentData: PomAgentData | undefined
): Parties & { producerName?: string; producerType?: string } => {
    const party: Parties & { producerName?: string; producerType?: string } = {
        partyType:
            agentData?.producerType === ProducerType.INDIVIDUAL
                ? PartyType.INDIVIDUAL
                : PartyType.ORGANIZATION,
        firstName: agentData?.firstName,
        lastName: agentData?.lastName,
        middleName: agentData?.middleName,
        fullName: agentData?.fullName,
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
                          identificationType: IdentificationTypeEnum.SSN,
                          identificationValue: agentData.socialSecurityNumber,
                      },
                  ]
                : []),
            ...(agentData?.alternateIds?.map((id) => ({
                identificationType: IdentificationTypeEnum.EXTERNAL,
                identificationKey: id.key?.toUpperCase(),
                identificationValue: id.value,
            })) || []),
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

    constructor(agent: PomAgentData | undefined) {
        super(transformPomAgentDataToParty(agent));
    }
}
