type PartyRole =
    | 'INSURED'
    | 'OWNER'
    | 'PAYOR'
    | 'PRIMARYBENEFICIARY'
    | 'PRIMARYSERVICINGAGENT'
    | 'PRIMARYWRITINGAGENT';
type Gender = 'FEMALE' | 'MALE';
type EmailType = 'PERSONAL';
type IdentifierType = 'EXTERNAL' | 'SSN';
type IdentifierKeyType = 'ECN' | 'Party Id' | 'UPN' | 'AOR';

export interface PersonalInformation {
    valid: boolean;
    birthSexValid: boolean;
    firstName: string;
    lastName: string;
    prefix: string;
    dateOfBirth: string; // Iso string
    gender: Gender;
    birthSex: Gender;
    birthState: string;
    birthCountry: string;
    citizenCountry: string;
}
interface Email {
    id: string;
    type: EmailType;
    address: string;
}
export interface EmailObject {
    preferredEmailId: string;
    emails: Email[];
}

interface identifier {
    type: IdentifierType;
    value: string;
    key: IdentifierKeyType;
}

interface AddressDetail {
    id: string;
    addressType: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    zipCode: number;
    zipCodeExt: number;
    country: string;
}

export interface AddressObject {
    preferredAddressId: string;
    addresses: AddressDetail[];
}

export interface PhoneNumberDetail {
    id: string;
    type: string;
    countryCode: string;
    areaCode: string;
    dialNumber: string;
}
export interface PhoneNumberObject {
    preferredPhoneId: string;
    phoneNumbers: PhoneNumberDetail[];
}

export interface party {
    partyType: string;
    personalInformation: PersonalInformation;
    partyId: string;
    partyCommunication: string;
    partyRole: PartyRole;
    partyPercentage: number;
    identifiers: identifier[];
    address: AddressObject;
    phoneNumber: PhoneNumberObject;
    email: EmailObject;
}

// This interface needs to be completed
export interface Policy {
    policyNumber: string;
    planCode: string;
    productType: string;
    policyStatus: string;
    policyHoldingForm: string;
    policyEffectiveDate: Date;
    issueState: string;
    issueCountry: string;
}

export type CustomIdentifierTypes =
    | 'applicationId'
    | 'crmId'
    | 'traceId'
    | 'redirectionURL';

export interface CustomIdentifier {
    key: CustomIdentifierTypes;
    value: string;
}

export interface Illustrations {
    source: string;
    illustrationId: string;
    customIdentifiers?: CustomIdentifier[];
}

// This interface WIP, just map the minimum required to use it
export interface NewBusiness {
    caseId: string;
    parties: party[];
    policy: Policy;
    illustrations: Illustrations;
}

export interface NewBusinessResponse {
    status?: string;
    timestamp?: Date;
    message: string;
    errors?: string[];
}
