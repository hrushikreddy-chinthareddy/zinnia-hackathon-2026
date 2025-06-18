import { Phone } from '@xd/api-types/dist/generated-types/sor';

import { ClaimActionTypes } from '@deps/containers/death-claim-container/death-claim.types';

export interface UpdatedBeneficiaryRecord {
    changeRequire: boolean | null;
    changeType: ChangeTypeEnum | null;
    beneDeceased: boolean;
    beneDeathDate: string | null;
    beneDeathSourceOfInfo: string | null;
    notificationPreferences: NotificationMethod;
}
export enum ChangeTypeEnum {
    BENEFICIARY_NOTIFICATION_CHANGE = 'BENEFICIARY_NOTIFICATION_CHANGE',
    BENEFICIARY_DECEASED = 'BENEFICIARY_DECEASED',
}
export interface NotificationMethod {
    notificationMethod: {
        action: string;
        method: string;
    };
    fax: {
        action?: ClaimActionTypes;
        faxNumber: string;
    };
    email: {
        action?: ClaimActionTypes;
        emailType: string;
        emailAddress: string;
    };
    address: {
        action?: ClaimActionTypes;
        addressId: string;
        addressType: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    phone: {
        phoneType: string;
        countryCode: string;
        areaCode: string;
        dialNumber: string;
        bestTime: string;
        phoneId: string;
    };
}

export interface BeneficiaryRecord {
    recordId: string;
    recordType: string;
    party: {
        partyId: string;
        partyRoleId: string;
        partyRole: string;
        partyType: string;
        prefix: string;
        firstName: string;
        lastName: string;
        fullName: string;
        gender: string;
        dateOfBirth: string;
        relationshipToInsured: string;
        beneficiaryPercentage: number;
        ssn: string;
    };
    notificationPreferences: NotificationMethod;
    changeRequire: boolean | null;
    changeType: string;
    beneDeceased: boolean;
    dateOfDeath: string;
    sourceOfInfo: string;
}

export interface CallLog {
    partyRoleCategory: string;
    partyRole: string;
    fullName: string;
    relationshipToInsured: string;
    phone: {
        phoneType: string;
        countryCode: string;
        areaCode: string;
        dialNumber: string;
        bestTime: string;
        phoneId: string;
    };
    callSequence: number;
    callDone: boolean;
}

export interface CallEntry {
    id: number;
    contactRole: string;
    name: string;
    phone: Phone;
}

export enum ContactRole {
    AGENT = 'AGENT',
    PRIMARYBENEFICIARY = 'PRIMARYBENEFICIARY',
    PRIMARYWRITINGAGENT = 'PRIMARYWRITINGAGENT',
    PRIMARYSERVICINGAGENT = 'PRIMARYSERVICINGAGENT',
    ADDITIONALSERVICINGAGENT = 'ADDITIONALSERVICINGAGENT',
    ADDITIONALWRITINGAGENT = 'ADDITIONALWRITINGAGENT',
    OTHER = 'OTHER',
}
