import { UserProfile } from '@deps/models/user-profile';
import { TransactionType } from '@zinnia/api-types/types/sor';

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
    DocumentViewer = 'Form Data',
    FormViewer = 'Form Viewer',
    NigoEntry = 'NIGO Entry',
    OftCase = 'OFT Case',
    PolicyDetails = 'Policy Details',
    PolicyManagementDashboard = 'Policy Management Dashboard',
    Reg60 = 'Reg 60',
    RenewalCaseDetails = 'Renewal Case Details',
    RmdCase = 'RMD Case',
    SendCorrespondence = 'Send Correspondence',
    SendStatement = 'Send Statement',
    SendDocument = 'Send Document',
    SendTaxForms = 'Send Tax Forms',
    DefaultCaseDataEntry = 'Default Case Data Entry',
    SswCase = 'SSW Case',
    WithdrawalCase = 'Withdrawal Case',
    Dashboard = 'Dashboard',
    CommissionsStatements = 'Commissions Statements',
    Usage = 'Usage',
    IllustrationsClientCase = 'Client Case Table',
    IllustrationsNewClientCase = 'New Client Case Form',
    IllustrationsDetails = 'Client Case Illustrations',
    OperationsReview = 'Request Operations Review',
}
/*
    Per Analytics Team: event names should not be customized to use case;
    instead, they should reflect the user action, such as "button clicked".
    The rest of the data should be included as event properties.
    taskId / caseId / policyId + planCode should be included if they are available
*/
export enum SegmentTrackedEventName {
    NewClientCaseCreated = 'New Client Case Created',
    ClientCaseEdited = 'Client Case Edited',
    ClientCaseTitleInput = 'New Client Case Title Input',
    ClientCaseAgencySelection = 'Client Case Agency Selection',
    ButtonClicked = 'button_clicked',
    DropdownClicked = 'dropdown_clicked',
    PolicyClicked = 'Policy Clicked', // FIXME: remove
    CaseClicked = 'Case Clicked', // FIXME: remove
    SearchSubmitted = 'search_submitted',
    FilterApplied = 'filter_applied',
    CaseDetailsTabClicked = 'Case Details Tab Clicked', // FIXME: remove
    CaseStageAccordionClicked = 'Case Stage Accordion Clicked', // FIXME: remove
    CaseDocumentClicked = 'Case Document Clicked', // FIXME: remove
    TransactionContinueClicked = 'Transaction Continue Clicked', // FIXME: remove
    TransactionCancelClicked = 'Transaction Cancel Clicked', // FIXME: remove
    TransactionSubmitted = 'transaction_submitted', // FIXME: remove
    ClientCaseClicked = 'Client Case Clicked', // FIXME: remove
    NewClientCaseClicked = 'New Client Case Clicked', //FIXME: remove
}

export enum IllustrationsSegmentTrackedEventName {
    newIllustrationClicked = 'New Illustration Clicked',
    calculateIllustration = 'Calculate Illustration',
    duplicateIllustration = 'Duplicate Illustration',
    editIllustration = 'Edit Illustration',
    getIllustrationPDF = 'get Illustration PDF',
    selectIllustrationForApplication = 'Select Illustration For Application',
    addProductToIllustrate = 'Add Product To Illustrate',
    archiveIllustration = 'Archive Illustration',
    unarchiveIllustration = 'Unarchive Illustration',
}

export interface BaseSegmentEventProps {
    authSessionId: string;
    policyId?: string;
    caseId?: string;
    planCode?: string;
    taskId?: string;
    userId?: string; // FIXME: remove; this is added by by Segment automatically
    correlationId?: string;
}
export type ButtonClickedEventProps = BaseSegmentEventProps & {
    buttonText: string;
};

export type SearchSubmittedEvent = BaseSegmentEventProps & {
    policyNumber?: string;
    ssnUsed: boolean;
    firstNameUsed: boolean;
    lastNameUsed: boolean;
    caseID?: string;
    agentName?: boolean;
    firmName?: string;
    documentNumber?: boolean;
};

export type IllustrationsSearchSubmittedEvent = BaseSegmentEventProps & {
    firstNameUsed: boolean;
    lastNameUsed: boolean;
    clientCaseID: string;
    agentFirstName: boolean;
    agentLastName: boolean;
    caseTitle: boolean;
    searchText?: string;
};

export type ClientCaseClickedEvent = BaseSegmentEventProps & {
    clientCaseID: string;
    linkUrl: string;
};

export type ClientCaseTitleInputEvent = BaseSegmentEventProps & {
    titleInput: boolean;
};

export type SelectAgencyEvent = BaseSegmentEventProps & {
    agencySelected: boolean;
};

export type AgentSearchEvent = BaseSegmentEventProps & {
    agentFirstName: boolean;
    agentLastName: boolean;
    agentSelected: boolean;
};

export type DropdownClickedEvent = BaseSegmentEventProps & {
    dropdownName: string;
} & (
        | { searchText: string }
        | { selectedItemName: string }
        | { searchText: string; selectedItemName: string }
        | { timestamp: Date }
    );

export type PolicyClickedEvent = BaseSegmentEventProps & {
    contractNumber?: string;
    linkName: string;
    linkUrl: string;
    planCode?: string;
};

export type CaseClickedEvent = BaseSegmentEventProps & {
    caseId: string;
};

export type IllustrationsClickedEvent = BaseSegmentEventProps & {
    productName: string;
    productMarketingName: string;
    productType: string;
    carrier: string;
};

export type IllustrationAddProductClickedEvent = BaseSegmentEventProps & {
    carrier: string;
};

export type IllustrationCalculateEvent = IllustrationsClickedEvent & {
    illustrationId: string;
};

export type CaseTabClickedEvent = BaseSegmentEventProps & {
    caseId: string;
    tabName: string;
};

export type CaseStageAccordionClickedEvent = BaseSegmentEventProps & {
    caseId: string;
    isOpen: boolean;
    stageId: string;
    stageName: string;
};

export type CaseDocumentClickedEvent = BaseSegmentEventProps & {
    documentId: string;
    type: string;
};

export type FilterAppliedEventProps = BaseSegmentEventProps & {
    filterValue: string;
    filterTarget: string;
};

export enum ExtendedTransactionType {
    CancelTransaction = 'CancelTransaction',
}

// TODO MG: this is the same as TransactionTrackEventProps
type BaseTransactionClickedEvent = BaseSegmentEventProps & {
    step?: TransactionStep;
    type?:
        | TransactionType
        | ContactCenterTransactionType
        | ExtendedTransactionType;
};

export type TransactionContinueClickedEvent = BaseTransactionClickedEvent & {
    correlationId?: string;
    transactionId?: string;
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
};

export type TransactionClickProps = {
    trackEventProps?: TransactionTrackEventProps;
};

export enum SegmentTrackEventState {
    Close = 'close',
    Open = 'open',
}

export enum TransactionCategory {
    FINANCIAL = 'financial',
    NON_FINANCIAL = 'non_financial',
    POLICY_UPDATE = 'policy_update',
}

export enum SegmentTransactionType {
    PREMIUM = 'premium',
    LOAN = 'loan',
    WITHDRAWAL = 'withdrawal',
    RMD = 'rmd',
    SURRENDER = 'surrender',
    DEATH_CLAIM = 'death_claim',
    NEW_LOAN = 'newloan',
    ALLOCATIONS = 'allocations',
    FREE_LOOK_CANCELLATION = 'free_look',
    FUND_TRANSFER = 'fund_transfer',
    ADDRESS = 'address',
    EMAIL = 'email',
    PHONE = 'phone',
    BANK_INFO = 'bank_info',
    BENEFICIARY = 'beneficiary',
    COMMUNICATION_PREFERENCE = 'comm_pref',
    NAME = 'name',
    OWNER = 'owner',
    JOINT_OWNER = 'joint_owner',
    PAYOR = 'payor',
    THIRD_PARTY = 'third_party',
}

export enum TransactionMode {
    ONE_TIME = 'one_time',
    AUTOPAY_SETUP = 'autopay_setup',
    AUTOPAY_MANAGE = 'autopay_manage',
    AUTOPAY_CANCEL = 'autopay_cancel',
    REQUEST = 'request',
    CHANGE = 'change',
    ADD = 'add',
    UPDATE = 'update',
    REMOVE = 'remove',
    CANCELLATION = 'cancellation',
}

export enum TransactionArea {
    PAYMENTS = 'payments',
    DISBURSEMENTS = 'disbursements',
    PEOPLE = 'people',
    FUNDS_ACCOUNTS = 'funds_accounts',
    POLICIES_CONTRACTS = 'policies_contracts',
}

export enum UI_SURFACE {
    FLOW = 'flow',
    SIDE_PANEL = 'side_panel',
}

export enum USER_TYPE {
    AGENT = 'agent',
    ZINNIA_CALL_CENTER = 'zinnia_call_center',
    ZINNIA_OPERATIONS = 'zinnia_operations',
}

export enum DOC_CONTEXT {
    EXISTING_CASE = 'existing_case',
    NEW_CASE = 'new_case',
}

// List of events we'll be tracking on successful transaction submit
export enum TransactionSubmittedEventType {
    ONE_TIME_PREMIUM = 'one_time_premium',
    SYSTEMATIC_PAYMENT_SETUP = 'systematic_payment_setup',
    SYSTEMATIC_PAYMENT_CANCEL = 'systematic_payment_cancel',
    SYSTEMATIC_PAYMENT_UPDATE = 'systematic_payment_update',
    ONE_TIME_LOAN = 'one_time_loan',
    SYSTEMATIC_LOAN_SETUP = 'systematic_loan_setup',
    SYSTEMATIC_LOAN_CANCEL = 'systematic_loan_cancel',
    SYSTEMATIC_LOAN_UPDATE = 'systematic_loan_update',
    ONE_TIME_WITHDRAWAL = 'one_time_withdrawal',
    SYSTEMATIC_WITHDRAWAL_SETUP = 'systematic_withdrawal_setup',
    SYSTEMATIC_WITHDRAWAL_CANCEL = 'systematic_withdrawal_cancel',
    SYSTEMATIC_WITHDRAWAL_UPDATE = 'systematic_withdrawal_update',
    ONE_TIME_RMD = 'one_time_rmd',
    SYSTEMATIC_RMD_SETUP = 'systematic_rmd_setup',
    SYSTEMATIC_RMD_CANCEL = 'systematic_rmd_cancel',
    SYSTEMATIC_RMD_UPDATE = 'systematic_rmd_update',
    SURRENDER = 'surrender',
    DEATH_CLAIM = 'death_claim',
    NEW_LOAN = 'new_loan',
    EDIT_ALLOCATIONS = 'edit_allocations',
    FREE_LOOK_CANCELLATION = 'free_look_cancellation',
    FUND_TRANSFER = 'fund_transfer',
    ADD_ADDRESS = 'add_address',
    UPDATE_ADDRESS = 'update_address',
    REMOVE_ADDRESS = 'remove_address',
    ADD_EMAIL = 'add_email',
    UPDATE_EMAIL = 'update_email',
    REMOVE_EMAIL = 'remove_email',
    ADD_PHONE = 'add_phone',
    UPDATE_PHONE = 'update_phone',
    REMOVE_PHONE = 'remove_phone',
    ADD_BANK_INFO = 'add_bank_info',
    UPDATE_BANK_INFO = 'update_bank_info',
    REMOVE_BANK_INFO = 'remove_bank_info',
    UPDATE_BENEFICIARIES = 'update_beneficiaries',
    UPDATE_COMMUNICATION_PREFERENCE = 'update_communication_preference',
    UPDATE_NAME = 'update_name',
    UPDATE_OWNER = 'update_owner',
    UPDATE_JOINT_OWNER = 'update_joint_owner',
    ADD_PAYOR = 'add_payor',
    REMOVE_PAYOR = 'remove_payor',
    ADD_THIRD_PARTY = 'add_third_party',
    REMOVE_THIRD_PARTY = 'remove_third_party',
}

export type TransactionSuccessfulEvent = BaseSegmentEventProps & {
    amount?: number; // contextual
    area: TransactionArea;
    autopay_frequency?: string; // contextual
    carrier: string; // Carrier Code, like SBUL or FNWL
    case_id: string; // CaseID provided by BPM on successful transaction
    category: TransactionCategory;
    correlation_id?: string;
    doc_context?: DOC_CONTEXT;
    environment: string; //
    event_version?: number;
    mode: TransactionMode;
    product_kind?: 'policy' | 'contract';
    submit_button_text?: string;
    tax_withholding_mode?: string; // contextual
    transaction_key: string; // composite key: <category>:<type>:<mode>
    type: SegmentTransactionType;
    ui_surface: UI_SURFACE;
    user_id: string;
    user_type?: string; // BPB - unsure how to get this (yet)
};
