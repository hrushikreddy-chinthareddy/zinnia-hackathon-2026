import { DocumentData } from '@deps/models/case/document';
import { Transaction } from '@deps/models/case/withdrawal/case';

import { ContractComparison, Disclosure } from './components/create-disclosure/create-disclosure.types';
import { DisclosureAuthorizationInformation } from './components/disclosure-authorization/disclosure-authorization.types';
import { UserInfo } from './components/user-information/user-information.type';
import { SegmentTrackedPageProps } from '@deps/types/segment-analytics';

export enum CurrentPage {
    INFO = 'info',
    COMPARISON = 'comparison',
}

export type Reg60FormProvider = {
    children: React.ReactNode;
    form: ActiveReg60Case;
};

export interface FormData {
    formExtName: string;
    metaData: {
        formId: string | null;
        formNumber: string | null;
        formType: string;
    };
}

export interface Reg60DigitalForm {
    taskType: string;
    carrier: string;
    status: string;
    data: Reg60FormData;
}

export enum UserFields {
    FirstName = 'firstName',
    MiddleName = 'middleName',
    LastName = 'lastName',
    OwnerSSN = 'ssNumber',
    UserPhoneNumber = 'phoneNumber',
    Extension = 'phoneExtension',
    PhoneType = 'phoneType',
    Channel = 'channel',
    AgentCompany = 'agentCompany',
    OwnerStreetAddress = 'ownerStreetAddress',
    OwnerStreetAddress2 = 'ownerStreetAddress2',
    OwnerStreetAddress3 = 'ownerStreetAddress3',
    City = 'city',
    State = 'state',
    Zip = 'zip',
    AgentStreetAddress = 'agentStreetAddress',
    AgentStreetAddress2 = 'agentStreetAddress2',
    AgentStreetAddress3 = 'agentStreetAddress3',
}

export enum TypeOfPaymentOptions {
    Fixed = 'Fixed',
    Variable = 'Variable',
}

export enum PartyRoles {
    OWNER = 'OWNER',
    AGENT = 'AGENT',
}
export interface FormParts {
    ownerInformation: UserInfo;
    agentInformation: UserInfo;
    disclosureAuthorization: DisclosureAuthorizationInformation;
    disclosure: Disclosure;
    currentPage: CurrentPage;
    document: DocumentData;
}

export interface ContractComparisonInterface {
    contractComparison: ContractComparison[];
}
export interface Reg60FormData {
    clientCode: string;
    contractNum: string;
    documentNumber: string | null;
    onbaseCaseId: string | null;
    source: string;
    taskType: string | null;
    userId: string | null;
    disclosureAuthorization: DisclosureAuthorizationInformation;
    agentInformation: UserInfo;
    ownerInformation: UserInfo;
    disclosure: Disclosure;
}

export interface ActiveReg60CaseData extends Reg60FormData {
    agentEmailAddress: string | null;
    documentNumber: string;
    onbaseCaseId: string;
}

export interface ActiveReg60Case extends Reg60DigitalForm {
    caseId: string;
    createdDate: string; // ISO Date String,
    data: ActiveReg60CaseData;
    source: string;
    id: string;
    updatedDate: string; // ISO Date String
}

export interface CreateReg60CaseProps extends SegmentTrackedPageProps {
    document: DocumentData;
    form: ActiveReg60Case;
    userId: string;
    transactionsHistory?: Transaction[];
    formParts: React.ReactNode;
}
