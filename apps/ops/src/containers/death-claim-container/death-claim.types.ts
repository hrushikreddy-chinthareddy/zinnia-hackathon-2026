import { PartyType, PartyRole, PhoneType } from '@zinnia/api-types/types/sor';

export enum RoleType {
    Agent = 'AGENT',
    Beneficiary = 'BENEFICIARY',
    Owner = 'OWNER',
    Other = 'OTHER',
    Annuitant = 'ANNUITANT',
}

export enum ClaimActionTypes {
    NONE = 'NONE',
    ADD = 'ADD',
    UPDATE = 'UPDATE',
}

export interface PartyObj {
    partyId: string;
    partyRoleId?: number;
    partyRole?: PartyRole;
    partyType?: PartyType;
    prefix: string | null;
    suffix: string | null;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    gender: string;
    dateOfBirth: string | null;
    relationshipToInsured: string;
}

export interface NotifirePartyObj {
    partyId: string;
    partyRoleId?: number;
    partyRole?: PartyRole;
    partyType?: PartyType;
    prefix: string | null;
    suffix: string | null;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    gender: string;
    dateOfBirth: string | null;
    relationshipToInsured: string;
    phone: NotifierPhone;
}

export interface DeceasedParty {
    party: PartyObj;
    isDeceased: boolean;
    isDiedInForeignCountry: boolean | null;
    dateOfDeath: string | null;
}

export interface NotifierPhone {
    action: ClaimActionTypes;
    phoneType: PhoneType;
    countryCode: string;
    dialNumber: string | null;
    areaCode: string | null;
}

export interface NotifierParty {
    notifierRole: RoleType | string;
    dateOfNotification: string;
    isPrimaryBeneInfoOnFile: boolean;
    party: NotifirePartyObj;
}

export interface NotificationMethod {
    party: PartyObj;
    email: PartyEmail;
    faxNumber: string | null;
    address: any;
    notificationMethod: ClaimCommunicationTypes | null;
}

export interface PartyEmail {
    action: ClaimActionTypes;
    emailType: any;
    emailAddress: string | null;
    emailId: number | null;
}

export enum ClaimCommunicationTypes {
    Email = 'EMAIL',
    Fax = 'FAXNUMBER',
    Mail = 'MAIL',
}
