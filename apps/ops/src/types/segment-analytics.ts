import { UserProfile } from "@deps/models/user-profile";

export interface SegmentTrackedPageProps {
    user: UserProfile;
}

export type SegmentProps = {
    [key: string]: string | string[] | number | undefined
}

export enum SegmentPageName {
    BeneChange = "Bene Change",
    CaseDetails = "Case Details",
    CaseManagementDashboard = "Case Management Dashboard",
    CreateCaseLanding = "Create Case Landing",
    DocumentViewer = "Document Viewer Page",
    FormViewer = "Form Viewer",
    NigoEntry = "NIGO Entry",
    OftCase = "OFT Case",
    PolicyDetails = "Policy Details",
    PolicyManagementDashboard = "Policy Management Dashboard",
    Reg60 = "Reg 60",
    RenewalCaseDetails = "Renewal Case Details",
    RmdCase = "RMD Case",
    SendCorrespondence = "Send Correspondence",
    SendDocument = "Send Document",
    SswCase = "SSW Case",
    WithdrawalCase = "Withdrawal Case",
}

export enum SegmentTrackedEventName {
    CaseDetailsClick = "Case Details Click",
    CaseFilterClick = "Case Filter Click",
    PolicyKeyValuesItemClick = "Policy Key Values Item Click",
    PolicySearch = "Policy Search",
    PolicyQuickActionsClick = "Policy Quick Actions Item Click",
    PolicyQuickActionsDropdown = "Policy Quick Actions Dropdown",
}

export enum SegmentTrackEventState {
    Close = "close",
    Open = "open",
}
