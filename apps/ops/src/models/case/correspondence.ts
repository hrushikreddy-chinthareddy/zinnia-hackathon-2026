import { Address } from '@zinnia/api-types/types/sor';

import { CommunicationTypes, SendDocumentActions } from './send-document';
import { Confirm } from './send-statement';

export const domainValidation = /^[a-zA-Z0-9](\.?[a-zA-Z0-9]){3,}@zinnia\.com$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export enum TransactionTypes {
    Statements = 'Statements',
    TaxForms = 'TaxForms',
}

export enum TransactionSubTypes {
    TaxForms = 'TAX',
}

export enum AttachmentType {
    Form = 'form',
    TaxForms = 'TAX_FORMS',
}

export type ContactCenterActions = CorrespondenceAction | SendDocumentActions;

export type SendCommunicationRequestBody = {
    ctiCallNumber: string;
    correlationId: string;
    createdBy: string;
    formType: string;
    receiverDetails: {
        deliveryType: CommunicationTypes;
        recipientList: string[];
        ccList?: string[];
        mailDetails?: PaperMail;
    };
    policyDetails: {
        contractNumber: string | null;
        planCode: string;
        carrier: string;
        productName: string;
        qualType: string;
        issueState: string;
        issueDate: string;
        status: string;
    };
    attachmentDetails: AttachmentDetails[];
};

export type PaperMail = {
    firstName: string;
    lastName: string;
    type: string;
    dob: string;
} & Address;

export type Correspondence = {
    type: string;
    recipients: string[];
    ccList?: string[];
    mailDetails?: PaperMail;
};

export enum CorrespondenceAction {
    Correspondence = 'Correspondence',
    Confirm = 'Confirm',
    Reset = 'Reset',
}

export type AttachmentDetails = {
    formId: string;
    transactionType?: string;
    transactionSubType?: string;
    displayName: string;
    formName: string;
    attachmentType: string;
    // required for the tax forms
    taxYear?: string;
    fChar?: string;
};

export type CorrespondenceActions =
    | { type: CorrespondenceAction.Correspondence; payload: Correspondence }
    | { type: CorrespondenceAction.Confirm; payload: Confirm }
    | { type: CorrespondenceAction.Reset };

export type CorrespondenceFormParts = {
    correspondence: Correspondence;
    confirm: Confirm;
};
