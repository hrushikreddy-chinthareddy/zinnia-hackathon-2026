import { Action, EntityTypeValue } from '@deps/constants/policy';
import {
    ExtendedAddress,
    ExtendedEmail,
    ExtendedPhone,
} from '@deps/contexts/RoleChangeContext';
import { FormMetadata } from '@deps/models/case/task';
import { LoggingContext } from '@deps/utils/server-logging';
export interface ApiFunction<RequestPayload, ResponseData> {
    (
        payload: RequestPayload,
        accessToken: string,
        logCtx: LoggingContext
    ): Promise<ResponseData | null>;
}

export interface TaskHandler<RequestPayload, ResponseData> {
    api: ApiFunction<RequestPayload, ResponseData>;
    getPayload: (task: any) => RequestPayload;
    transformResponse: (
        response: ResponseData,
        metadata: FormMetadata[],
        task: any
    ) => void;
}

export interface ReviewPayload {
    category: string[];
    businessProcess: string;
    carrier?: string;
}

export interface Reason {
    detailedReason: string;
    exceptionSubRefs: any[];
    nmId: string;
    category: string;
    reason: string;
}

export interface AgentTaskPayload {
    category: string[];
    businessProcess: string;
    carrier?: string;
    policyNumber: string;
    planCode: string;
    logCtx?: LoggingContext;
}

export interface BeneficiaryTaskPayload {
    category: string[];
    businessProcess: string;
    carrier?: string;
    policyNumber: string;
    planCode: string;
    logCtx?: LoggingContext;
}

export interface AssigneeTaskPayload {
    category: string[];
    businessProcess: string;
    carrier?: string;
    policyNumber: string;
    planCode: string;
    logCtx?: LoggingContext;
}

export interface PartyRole {
    partyRole: string;
    partyId: string;
    relationshipToParty: string;
    partyRoleId?: string;
    endDate?: string;
    collateralAmount?: number;
}

export interface Identification {
    identificationType: string | null;
    identificationValue: string | null;
    endDate: string | null;
    identificationDescription?: string | null;
    identificationId?: string;
    identificationKey?: string | null;
    issueCountry?: string | null;
    issueState?: string | null;
    startDate?: string | null;
}

export interface Party {
    partyRoleId?: string | null;
    partyRole?: string;
    partyId?: string;
    partyType?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    dateOfBirth?: string;
    trustType?: string;
    addresses: ExtendedAddress[];
    phones: ExtendedPhone[];
    emails: ExtendedEmail[];
    identifications: Identification[];
    supportingDocumentAttached: boolean;
    prefix?: string;
    suffix?: string;
    trustDate?: string;
    agentExternalId?: string;
    agentFullName?: string;
    agentPercentage?: number;
    agentType?: string;
    entityType?: EntityTypeValue | string;
    preferredCommunicationType?: string | null;
    isIrrevocable?: boolean;
}

export interface PolicyResponse {
    partyRoles: PartyRole[];
    parties: Party[];
}

export enum PartyRoleType {
    OWNER = 'OWNER',
    JOINTOWNER = 'JOINTOWNER',
    PRIMARYBENEFICIARY = 'PRIMARYBENEFICIARY',
    CONTINGENTBENEFICIARY = 'CONTINGENTBENEFICIARY',
    PRIMARYWRITINGAGENT = 'PRIMARYWRITINGAGENT',
    PRIMARYSERVICINGAGENT = 'PRIMARYSERVICINGAGENT',
    THIRDPARTYDESIGNEE = 'THIRDPARTYDESIGNEE',
    ASSIGNEE = 'ASSIGNEE',
}

export enum PartyRoleLabel {
    OWNER = 'Owner',
    JOINTOWNER = 'Joint Owner',
    PRIMARYBENEFICIARY = 'Primary Beneficiary',
    CONTINGENTBENEFICIARY = 'Contingent Beneficiary',
    PRIMARYWRITINGAGENT = 'Primary Writing Agent',
    PRIMARYSERVICINGAGENT = 'Primary Servicing Agent',
    THIRDPARTYDESIGNEE = 'Third Party Designee',
}

export enum AddressType {
    RESIDENCE = 'RESIDENCE',
    MAILING = 'DEFAULT',
}

export enum AddressTypeLabel {
    RESIDENCE = 'Residential Address',
    MAILING = 'Mailing Address',
}

export type ApiResponse = {
    nigoSearchResult: Reason[];
    policyResult: PolicyResponse;
} | null;

export interface Address {
    addressType: AddressType | string;
    addressLine1: string;
    city: string;
    state: string | null;
    zipCode: string;
    zipCodeExtension?: string | null;
    country?: string;
    endDate?: string | null;
    isPreferred?: boolean;
    startDate?: string | null;
}

export interface Phone {
    phoneType: string;
    dialNumber: string | null;
    areaCode?: string | null;
    countryCode?: string;
    endDate?: string | null;
    isPreferred?: boolean;
    startDate?: string | null;
}

export interface Email {
    emailAddress: string | null;
    emailType: string;
    endDate?: string | null;
    isPreferred?: boolean;
    startDate?: string | null;
}

export type ActionDataItem = {
    action: Action;
    supportingDocumentAttached: boolean | null;
    party: {
        partyId: string | null;
        partyType: string | null;
        prefix: string | null;
        firstName: string | null;
        middleName: string | null;
        lastName: string | null;
        fullName: string | null;
        entityType: EntityTypeValue | string;
        gender: null;
        dateOfBirth: null;
        trustType: string | null;
        trustDate: string | null;
        preferredCommunicationType?: string | null;
        addresses: Address[];
        phones: Phone[];
        emails: Email[];
        identifications: Identification[];
        collateralAmount?: number | null;
    };
};

export type Signatures = {
    isSigned: boolean | null;
    signDate: string | null;
    signExtension: any;
    signName: string | null;
    signType: string | null;
    isSignatureValid?: boolean | null;
    signatureComment?: string;
    isNotaryValid?: boolean | null;
    signGuaranteeStamp?: string | null;
    commissionExpiryDate?: string | null;
    ssn?: string | null;
    isDesignationPresent?: boolean | null;
};

export enum TransactionSearchIdentifiers {
    PAYMENT_RECORD_ID = 'paymentRecordId',
    ZL_CASE_ID = 'zlCaseId',
}
