import { Simplify, ValueOf } from 'type-fest';

import { UnderwritingClass } from '@deps/components/illustrations/helpers/illustrationApiSchemas';

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
    dateOfBirth: string; // ISO string
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
    personalInformation: Partial<PersonalInformation>;
    partyId: string;
    partyCommunication: string;
    partyRole: PartyRole;
    partyPercentage?: number;
    identifiers: identifier[];
    address?: AddressObject;
    phoneNumber?: PhoneNumberObject;
    email?: EmailObject;
}

interface PolicyCoverage {
    faceAmount?: number;
}

// This interface needs to be completed
export interface Policy {
    policyNumber?: string;
    planCode: string;
    productType: string;
    policyStatus?: string;
    policyHoldingForm: string;
    policyEffectiveDate?: Date;
    issueState: string;
    issueCountry: string;
    coverage?: PolicyCoverage;
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

export const SUBMISSION_TYPES = {
    ELECTRONIC: 'ELECTRONIC',
    PAPER: 'PAPER',
} as const;
export type SubmissionType = ValueOf<typeof SUBMISSION_TYPES>;

export const APPLICATION_STATUSES = {
    ABANDONED: 'ABANDONED',
    DECLINED: 'DECLINED',
} as const;
export type ApplicationStatus = ValueOf<typeof APPLICATION_STATUSES>;

export const POLICY_HISTORY_TYPES = {
    REPLACEMENT: 'REPLACEMENT',
    NONREPLACEMENT: 'NONREPLACEMENT',
    CONVERSION: 'CONVERSION',
} as const;
export type PolicyHistoryType = ValueOf<typeof POLICY_HISTORY_TYPES>;

type PolicyHistoryItems = {
    CONVERSION: {
        carrier?: string;
        policyNumber: string;
        restrictionIndicator?: boolean;
        mecIndicator?: boolean;
    };
    REPLACEMENT: object;
    NONREPLACEMENT: object;
};

interface PolicyHistoryItemBase {}

export type PolicyHistoryItem = Simplify<
    ValueOf<{
        [K in keyof PolicyHistoryItems]: {
            type: K;
        } & PolicyHistoryItemBase &
            PolicyHistoryItems[K];
    }>
>;

interface Application {
    startDate: string;
    submissionType: SubmissionType;
    formNumber?: string;
    versionNumber?: string;
    expirationDate?: string;
    replacementIndicator?: boolean;
    policyHistory: PolicyHistoryItem[];
}

export interface Underwriting {
    decision?:
        | 'APPROVED'
        | 'PENDING_DECISION'
        | 'PENDING_REVIEW'
        | 'DECLINED'
        | 'RISK_NOT_ACCEPTABLE';
    underwritingRiskClass?: UnderwritingClass;
    decisionRiskClass?: UnderwritingClass;
    underwritingMethod?: string;
    approvedFaceAmount?: number;
    approvedFaceAmountMaximum?: number;
    exclusionReview?: {
        description?: string;
        reasonCode?: string;
    }[];
}

// This interface WIP, just map the minimum required to use it
export interface NewBusiness {
    caseId: string;
    parties: party[];
    policy: Policy;
    illustrations: Illustrations;
    application: Application;
    underwriting: Underwriting;
}

export const isConversionPolicyHistoryItem = (
    item: PolicyHistoryItem | undefined
): item is Extract<
    PolicyHistoryItem,
    { type: typeof POLICY_HISTORY_TYPES.CONVERSION }
> => item?.type === POLICY_HISTORY_TYPES.CONVERSION;

export interface NewBusinessResponse {
    status?: string;
    timestamp?: Date;
    message: string;
    errors?: string[];
}
