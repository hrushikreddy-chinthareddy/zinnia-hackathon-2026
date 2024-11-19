import { UserProfile } from '@deps/models/user-profile';

export interface SegmentTrackedPageProps {
    user: UserProfile;
}

export type SegmentProps = {
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
    SswCase = 'SSW Case',
    WithdrawalCase = 'Withdrawal Case',
}

export enum SegmentTrackedEventName {
    SearchSubmitted = 'Search Submitted',
    DropdownClicked = 'Dropdown Clicked',
    PolicyClicked = 'Policy Clicked',
    CaseClicked = 'Case Clicked',
    FilterClicked = 'Filter Clicked',
}

export interface BaseSegmentEventProperties {
    userId: string;
}

export type SearchSubmittedEvent = BaseSegmentEventProperties & {
    policyNumber?: string;
    ssnUsed: boolean;
    firstNameUsed: boolean;
    lastNameUsed: boolean;
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

export type FilterClickedEvent = BaseSegmentEventProperties & {
    selectedItemName: string;
};

export enum SegmentTrackEventState {
    Close = 'close',
    Open = 'open',
}
