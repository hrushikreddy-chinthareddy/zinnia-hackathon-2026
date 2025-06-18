export type Address = {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
};

export type Party = {
    partyId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    ssn: string;
    partyRole: string;
};

export type Phone = {
    number: string;
    type: string;
};

export type BeneficiaryEntity = {
    recordId: string;
    partyRole: string; // Moved partyRole to the entity level to match the response
    party: Party;
    phone: Phone;
    address: Address;
    emails: string[];
    faxNumber: string;
    deliveryMethod: string;
    requestNotification: string;
    followupTasks: any[];
};

export type BeneficiaryRecord = {
    name: string;
    zlCaseId: string;
    recordId: string;
    correlationId: string;
    transactionType: string;
    carrier: string;
    source: string;
    entityType: string;
    entityId?: string;
    entity: BeneficiaryEntity;
    expireTs?: string;
    createdTs?: string;
    updatedTs?: string;
    createdBy?: string;
    updatedBy?: string;
    identifiers?: TransactionIdentifier[];
};

export type TransactionIdentifier = {
    identifier: string;
    value: string;
};

export enum EntityTypes {
    IDN_CLAIM_BENE_RECORD = 'IDN_CLAIM_BENE_RECORD',
}
