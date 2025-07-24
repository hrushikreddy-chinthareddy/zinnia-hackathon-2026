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

interface PersonalInformation {
    valid: boolean;
    birthSexValid: boolean;
    firstName: string;
    lastName: string;
    prefix: string;
    dateOfBirth: Date;
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
interface EmailObject {
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

interface Address {
    preferredAddressId: string;
    addresses: AddressDetail[];
}

export interface party {
    partyRole: PartyRole;
    personalInformation: PersonalInformation;
    email: EmailObject;
    identifiers: identifier[];
    address: Address;
}

// This interface needs to be completed
interface Policy {
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
