import { DocumentData } from '@deps/models/case/document';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';
import {
    PartyRole,
    Phone,
    Policy,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

export type ApplyToRolesState = {
    policyNumber: string;
    partyId: string;
    partyRole: PartyRole;
    partyRoleId: string;
};

export enum ContractUpdateOptions {
    currentContract = 'currentContract',
    otherContract = 'otherContract',
}

export type SignatureState = {
    signatures: SignatureWithdrawal[];
};

export type AddressChangePayload = {
    applyToRoles: ApplyToRolesState[];
    roleIdentifier: PolicyPartyRoles;
    signatureData: SignatureState;
    formData: any;
    document: DocumentData;
    planCode: string;
    policy: Policy;
    phone: Phone;
    selectedDocument: DocumentData | null;
};
