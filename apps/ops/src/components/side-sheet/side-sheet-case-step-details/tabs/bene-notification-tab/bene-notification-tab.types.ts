import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '@deps/containers/death-claim-container/death-claim.types';
import { Party } from '@deps/models/case/withdrawal/case';
import { EmailType, AddressType } from '@deps/models/policy/sor-policy';

export enum DeliveryMethods {
    Email = 'EMAIL',
    Faxnumber = 'FAXNUMBER',
    Mail = 'MAIL',
}

export enum FollowupId {
    fifth = 5,
}

export enum NotificationStatus {
    Send = 'SEND',
    Receive = 'RECEIVE',
    Overdue = 'OVERDUE',
    Scheduled = 'SCHEDULED',
    Canceled = 'CANCELED',
    Reset = 'RESET',
    Resend = 'RESEND',
    Generating = 'GENERATING',
    NIGO = 'NIGO',
    Exception = 'TERMINATE',
}

export interface INotification {
    notificationName: string;
    followupScheduleId: number;
    followupId: number;
    followupAttemptId: number;
    deliveryMethod: DeliveryMethods;
    address?: any;
    email?: string;
    faxNumber?: string;
    followupStatus: NotificationStatus;
    sendDateTime?: string;
    statusDateTime?: string;
    overdueDateTime?: string | null;
    receiveDateTime?: string | null;
    scheduleDateTime?: string;
    send?: boolean;
    receive?: boolean;
    dueToResend?: boolean;
    dueToReset?: boolean;
}

export type NotificationsTransactionIdentifier = {
    identifier: string;
    value: string;
};

export type NotificationEntity = {
    notificationPreferences?: NotificationPreferences;
    followupDetails: INotification[];
    party: Party;
};

export type NotificationsTransactionData = {
    recordId: string;
    correlationId: string;
    transactionType: string;
    carrier: string;
    source: string;
    entityType: string;
    entityId: string;
    entity: NotificationEntity;
    expireTs: string;
    createdTs: string;
    updatedTs: string;
    createdBy: string;
    updatedBy: string;
    identifiers?: NotificationsTransactionIdentifier[];
};

export type NotificationPreferences = {
    notificationMethod: NotificationMethod;
    fax?: FaxNotificationMethod;
    email?: EmailNotificationMethod;
    address?: any;
};

export type NotificationMethod = {
    method: ClaimCommunicationTypes;
    action?: ClaimActionTypes;
};

export type FaxNotificationMethod = {
    faxNumber: string;
    action?: ClaimActionTypes;
};

export type EmailNotificationMethod = {
    emailType: EmailType;
    emailAddress: string;
    action?: ClaimActionTypes;
};

export type AddressNotificationMethod = {
    addressId: string;
    addressType: AddressType;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    zipCodeExtension?: string;
    action?: ClaimActionTypes;
};
