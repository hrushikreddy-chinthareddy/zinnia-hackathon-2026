import {
    ExtendedAddress,
    ExtendedEmail,
    ExtendedPhone,
} from '@deps/contexts/RoleChangeContext';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
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
        task?: ManagementTask
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

export interface BeneficiaryTaskPayload {
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
    relationshipToParty?: string;
}

export interface Party {
    partyId?: string;
    partyType?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    trustType?: string;
    addresses: ExtendedAddress[];
    phones: ExtendedPhone[];
    emails: ExtendedEmail[];
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
}

export enum PartyRoleLabel {
    OWNER = 'Owner',
    JOINTOWNER = 'Joint Owner',
    PRIMARYBENEFICIARY = 'Primary Beneficiary',
    CONTINGENTBENEFICIARY = 'Contingent Beneficiary',
}

export enum AddressType {
    RESIDENCE = 'RESIDENCE',
    MAILING = 'MAILING',
}

export enum AddressTypeLabel {
    RESIDENCE = 'Residential Address',
    MAILING = 'Mailing Address',
}
