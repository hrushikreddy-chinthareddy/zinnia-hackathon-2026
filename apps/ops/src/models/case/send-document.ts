import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';

import { Correspondence } from './correspondence';
import { PartyRole } from '../policy/sor-policy';

export const sendDocumentTabs = {
    formSelection: 'Form Selection',
    correspondence: 'Correspondence',
    confirm: 'Confirm',
};

export enum CommunicationTypes {
    Email = 'Email',
    Fax = 'Fax',
    Mail = 'paper_mail',
}

export enum SendDocumentAction {
    TransactionType = 'Transaction_Type',
    TransactionSubType = 'Transaction_Sub_Type',
    Documents = 'Documents',
    Correspondence = 'Correspondence',
    PaperMail = 'Paper_Mail',
    Confirm = 'Confirm',
    Reset = 'Reset',
}

export type SendDocumentActions =
    | { type: SendDocumentAction.TransactionType; payload: CallCenterElement<string, SimpleOption> }
    | { type: SendDocumentAction.TransactionSubType; payload: CallCenterElement<string, SimpleOption> }
    | { type: SendDocumentAction.Documents; payload: CallCenterElement<FormDetails, FormDetails> }
    | { type: SendDocumentAction.Correspondence; payload: Correspondence }
    | { type: SendDocumentAction.Confirm; payload: Confirm }
    | { type: SendDocumentAction.Reset };

export type TransactionType = {
    id: string;
    name: string;
};

export type TransactionSubType = TransactionType;

export type SearchFormRequestBody = {
    contractNumber: string | null;
    planCode: string;
    transactionType: string;
    transactionSubType: string;
    carrier: string;
    issueState: string;
    ctiCallNumber: string;
};

export type FormDetails = {
    formId: number;
    formNumber: string;
    formDisplayName: string;
    formShortName?: string;
};

export enum SendDocumentFormType {
    ServiceRequestForm = 'Service Request Form',
}
export const AllowedRoleTypes: string[] = [PartyRole.JOINTOWNER, PartyRole.OWNER];

export type SendDocumentFormParts = {
    transactionType: CallCenterElement<string, SimpleOption>;
    transactionSubType: CallCenterElement<string, SimpleOption>;
    document: CallCenterElement<FormDetails, FormDetails>;
};

export type SendDocumentFormPartsAdditionData = {
    id: string;
} & SendDocumentFormParts;

export type Confirm = {
    caseId: string;
    message: string;
    correlationId: string;
};

export type CallCenterElement<Selected, ListType> = {
    selected: Selected | null;
    list: ListType[];
};
