export type AdditionalDataInstance = {
    [key: string]: string;
};

export enum CommunicationTypes {
    Email = 'EMAIL',
    Fax = 'FAX',
    Mail = 'MAIL',
}

export const correspondenceTypes = {
    [CommunicationTypes.Email]: {
        value: CommunicationTypes.Email,
        key: 'receiverDetail',
    },
    [CommunicationTypes.Fax]: {
        value: CommunicationTypes.Fax,
        key: 'receiverDetail',
    },
    [CommunicationTypes.Mail]: {
        value: CommunicationTypes.Mail,
        key: 'mailDetails_',
    },
};

export enum AdditionalDataIds {
    correspondenceRequest = 'requestAck.processFormRequestReceived',
    sedRequest = 'requestCompletion.deliverLetter',
}

export enum CorrespondenceStatus {
    DELIVERED = 'Delivered',
    INITIATED = 'Initiated',
    BOUNCE = 'Bounce',
    FAILURE = 'Failure',
    DROPPED = 'Dropped',
}
