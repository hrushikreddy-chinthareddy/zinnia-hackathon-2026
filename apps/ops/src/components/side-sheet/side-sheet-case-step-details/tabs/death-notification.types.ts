import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import { DeliveryMethods } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab.types';

export interface DeathNotificationSidesheetProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
}

export interface Party {
    fullName: string;
    phone?: Phone;
}

export interface Address {
    addressLine1: string;
    addressLine2: string;
    addressLine3?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface Email {
    emailAddress: string;
}

export interface Phone {
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
    notificationMethod: DeliveryMethods;
    email?: Email;
    address?: Address;
    faxNumber?: string;
}

export interface DeathNotificationData {
    notifiers: Notifier;
    owners: Owner[];
    beneficiaries: Beneficiary[];
}
