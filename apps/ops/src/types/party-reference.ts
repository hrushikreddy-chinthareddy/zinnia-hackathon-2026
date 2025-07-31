export interface ExternalPartyId {
    key: string;
    value: string;
}

export interface AliasBase {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    carrier?: string;
    externalPartyIds?: ExternalPartyId[];
    policyNumber?: string;
    planCode?: string;
    partyId?: string;
    partyRoles?: string[];
    externalId?: string;
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
    alias: AliasBase[];
}
