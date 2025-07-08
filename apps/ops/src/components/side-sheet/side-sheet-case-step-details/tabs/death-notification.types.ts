import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '@deps/containers/death-claim-container/death-claim.types';
export interface DeathNotificationSidesheetProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
}

export interface Party {
    fullName: string;
    phone?: Phone;
}

export interface Address {
    action: ClaimActionTypes;
    addressLine1: string;
    addressLine2: string;
    addressLine3?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface Email {
    action: ClaimActionTypes;
    emailAddress: string;
}

export interface Phone {
    action: ClaimActionTypes;
    dialNumber: string;
}
export interface Notifier {
    dateOfNotification?: string | null;
    notifierRole: string;
    party: Party;
    isPrimaryBeneInfoOnFile: boolean;
}

export interface Owner {
    party: {
        fullName: string;
        partyRole: string;
    };
    isDeceased: boolean;
    dateOfDeath: string;
    isDiedInForeignCountry: boolean;
}

export interface Beneficiary {
    party: Party;
    notificationMethod: ClaimCommunicationTypes;
    email?: Email;
    address?: Address;
    faxNumber?: string;
}

export interface DeathNotificationData {
    notifiers: Notifier;
    owners: Owner[];
    beneficiaries: Beneficiary[];
}
