export type AdditionalDataInstance = {
    [key: string]: string;
};

export enum CommunicationTypes {
    Email = 'EMAIL',
    Fax = 'FAX',
    Mail = 'MAIL',
}

export enum CaseAdditionalDataKeys {
    policyNumber = 'policyNumber',
    transactionSubType = 'transactionSubType',
    requestSubType = 'requestSubType',
    formName = 'formName',
    deliveryMethod = 'deliveryMethod',
    formId = 'formId',
    documentName = 'documentName',
    documentId = 'documentId',
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
    completeRequest = 'requestCompletion.completeRequest',
}

export enum CorrespondenceStatus {
    DELIVERED = 'Delivered',
    INITIATED = 'Initiated',
    BOUNCE = 'Bounce',
    FAILURE = 'Failure',
    DROPPED = 'Dropped',
}
