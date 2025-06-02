import { PartyRole } from '@zinnia/api-types/types/sor';

export const SendStatementTabs = {
    formSelection: 'Statement Selection',
    correspondence: 'Correspondence',
    confirm: 'Confirm',
};

export enum StatementTypes {
    AnniversaryStatement = 'ANN',
    AnnualStatement = 'ANNSTM',
    QuarterlyStatement = 'SOA',
}

export const StatementStartYear = '2022-Q1';

export type StatementTypesResponse = {
    applicableStatement: StatementTypes[];
};

export type SearchStatementBody = {
    contractNumber: string | null;
    planCode: string;
    carrier: string;
    issueState: string;
    ctiCallNumber: string;
};

export type FormDetails = {
    formId: number;
    formNumber: string;
    formDisplayName: string;
};

export type SendCommunicationRequestBody = {
    contractNumber: string | null;
    planCode: string;
    carrier: string;
    ctiCallNumber: string;
    type: string;
    recipient: string;
    correlationId: string;
    productName: string;
    qualType: string;
    status: string;
    issueState: string;
    issueDate: string;
    createdBy: string;
    formType: SendStatementFormType;
};

export enum SendStatementFormType {
    ServiceRequestForm = 'Service Request Form',
}
export const AllowedRoleTypes: string[] = [PartyRole.JOINTOWNER, PartyRole.OWNER];

export type Confirm = {
    caseId: string;
    message: string;
    correlationId: string;
};

export type CallCenterElement<Selected, ListType> = {
    selected: Selected | null;
    list: ListType[];
};
