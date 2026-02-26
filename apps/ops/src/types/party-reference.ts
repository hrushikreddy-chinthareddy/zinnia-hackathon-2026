import { AliasModel } from 'api-types/generated-types/partyreference/types.gen';

export interface ExternalPartyId {
    key: string;
    value: string;
}

export interface PartyReference {
    partyId: string;
    authId: string[];
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    taxId: string;
    taxIdType: string;
    lastUpdated: string; // ISO date string
    createdAt: string; // ISO date string
    id: string;
    alias: AliasModel[];
}
