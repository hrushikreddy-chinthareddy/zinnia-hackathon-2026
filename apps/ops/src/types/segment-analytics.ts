import { TransactionType } from '@zinnia/api-types/types/sor';

import { UserProfile } from '@deps/models/user-profile';

export interface SegmentTrackedPageProps {
    user: UserProfile;
}

export type SegmentPageProps = {
    [key: string]: string | string[] | number | undefined;
};

export enum SegmentPageName {
    BeneChange = 'Bene Change',
    CaseDetails = 'Case Details',
    CaseManagementDashboard = 'Case Management Dashboard',
    CreateCaseLanding = 'Create Case Landing',
    DocumentViewer = 'Document Viewer Page',
    FormViewer = 'Form Viewer',
    NigoEntry = 'NIGO Entry',
    OftCase = 'OFT Case',
    PolicyDetails = 'Policy Details',
    PolicyManagementDashboard = 'Policy Management Dashboard',
    Reg60 = 'Reg 60',
    RenewalCaseDetails = 'Renewal Case Details',
    RmdCase = 'RMD Case',
    SendCorrespondence = 'Send Correspondence',
    SendDocument = 'Send Document',
    SendTaxForms = 'Send Tax Forms',
    SswCase = 'SSW Case',
    WithdrawalCase = 'Withdrawal Case',
    Dashboard = 'Dashboard',
}

export enum SegmentTrackedEventName {
    SearchSubmitted = 'Search Submitted',
    DropdownClicked = 'Dropdown Clicked',
    PolicyClicked = 'Policy Clicked',
    CaseClicked = 'Case Clicked',
    FilterApplied = 'Filter Applied',
    CaseDetailsTabClicked = 'Case Details Tab Clicked',
    CaseStageAccordionClicked = 'Case Stage Accordion Clicked',
    CaseDocumentClicked = 'Case Document Clicked',
    TransactionContinueClicked = 'Transaction Continue Clicked',
    TransactionCancelClicked = 'Transaction Cancel Clicked',
}

export interface BaseSegmentEventProperties {
    session_id: string;
    userId: string;
}

export type SearchSubmittedEvent = BaseSegmentEventProperties & {
    policyNumber?: string;
    ssnUsed: boolean;
    firstNameUsed: boolean;
    lastNameUsed: boolean;
    caseID?: string;
    agentName?: boolean;
    firmName?: string;
    documentNumber?: boolean;
};

export type DropdownClickedEvent = BaseSegmentEventProperties & {
    dropdownName: string;
} & ({ searchText: string } | { selectedItemName: string } | { searchText: string; selectedItemName: string });

export type PolicyClickedEvent = BaseSegmentEventProperties & {
    contractNumber?: string;
    linkName: string;
    linkUrl: string;
};

export type CaseClickedEvent = BaseSegmentEventProperties & {
    caseId: string;
};

export type CaseTabClickedEvent = BaseSegmentEventProperties & {
    caseId: string;
    tabName: string;
};

export type CaseStageAccordionClickedEvent = BaseSegmentEventProperties & {
    caseId: string;
    isOpen: boolean;
    stageId: string;
    stageName: string;
};

export type CaseDocumentClickedEvent = BaseSegmentEventProperties & {
    documentId: string;
    type: string;
};

export type FilterClickedEvent = BaseSegmentEventProperties & {
    selectedItemName: string;
};

// TODO MG: this is the same as TransactionTrackEventProps
type BaseTransactionClickedEvent = BaseSegmentEventProperties & {
    step?: TransactionStep;
    type?: TransactionType | ContactCenterTransactionType;
}

export type TransactionContinueClickedEvent = BaseTransactionClickedEvent & {
    correlationId?: string;
};

export type TransactionCancelClickedEvent = BaseTransactionClickedEvent;

// TODO MG: move these - not so much segment related as they are transactionButton props
export enum TransactionStep {
    Amount = 'amount',
    Cancel = 'cancel',
    // TODO MG: need?
    Confirm = 'confirm',
    Date = 'date',
    Payees = 'payees',
    Payment = 'payment',
    Payor = 'payor',
    Start = 'start',
    Summary = 'summary',
    Taxes = 'taxes',
    Transfer = 'transfer',
}

export enum ContactCenterTransactionType {
    CORRESPONDENCE = 'CORRESPONDENCE',
    DOCUMENT = 'DOCUMENT',
    STATEMENT = 'STATEMENT',
    TAX_FORM = 'TAX_FORM',
}

type TransactionTrackEventProps = {
    correlationId?: string;
    type?: TransactionType | ContactCenterTransactionType;
    step?: TransactionStep;
}

export type TransactionClickProps = {
    trackEventProps?: TransactionTrackEventProps;
}

export enum SegmentTrackEventState {
    Close = 'close',
    Open = 'open',
}
