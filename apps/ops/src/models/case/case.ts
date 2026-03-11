import { AdditionalDataInstance } from './additional-data-instance';
import { DocumentInstance } from './document-instance';
import { EventInstance } from './event-instance';
import { ExceptionInstance } from './exception-instance';
import { IdentifierInstance } from './identifier-instance';
import { NoteInstance } from './note-instance';
import { PartyInstance } from './party-instance';
import { CaseOwner } from './renewal/case-owner';
import { StageInstance } from './stage-instance';
import { TaskInstance } from './task-instance';

export enum CaseIdentifier {
    DocumentNumber = 'documentNumber',
    BusinessKey = 'businessKey',
    contractNumber = 'contractNumber',
    DocumentNum = 'documentNum',
    TransactionId = 'transactionId',
    PolicyNumber = 'policyNumber',
    ZlCaseId = 'zlCaseId',
}

// CaseAdditionalData doesn't exist on the spec yet, typing based off QA response
export type CaseAdditionalData = {
    dataType?: string;
    entityType?: string;
    label?: string;
    id?: string;
    source?: string;
    value?: string;
};

export type caseProcessingDetails = {
    detailType: string;
    details: {
        performedBy?: string;
        source?: string;
        partyId?: string;
        applicationType?: string;
    };
    eventTimeStamp: number;
};

export type Case = {
    additionalData: AdditionalDataInstance;
    applicationType?: string;
    escalated?: boolean;
    carrier: string;
    caseAdditionalData?: CaseAdditionalData[];
    caseStatus: Statuses;
    correlationId?: string;
    correspondenceDocs?: DocumentInstance[];
    createdAt: string;
    deleted?: boolean;
    documents: DocumentInstance[];
    events: EventInstance[];
    exceptions: ExceptionInstance[];
    id: string;
    identifiers: IdentifierInstance[];
    linkDetails?: {
        linkedCaseInstanceId: string | null;
        linkedReason: string;
    };
    mappedDocuments: string[];
    mappedExceptions: string[];
    mappedNotes: string[] | null;
    mappedTasks: string[];
    notes: NoteInstance[];
    parentInstanceId?: string | null;
    parties: PartyInstance[];
    planCode?: string; // BPB - Per Pradeep, this will be added soon
    primary?: boolean;
    processSubType?: string;
    policyNumber: string;
    process: Processes;
    productName: string;
    stages: StageInstance[];
    systemUpdatedDt?: number;
    tasks: TaskInstance[];
    templateId: string;
    updatedAt: string;
    caseResult?: string;
    caseResultDetail?: string;
    caseProcessingDetails?: caseProcessingDetails[];
    techExceptionCount?: number;
    techExceptionStatus?: string;
};

// Case Type and a Case's Process are the same
export enum CaseType {
    Oft = 'OFT',
    Renewal = 'Renewal',
    Rmd = 'RMD',
    Withdrawal = 'Withdrawal',
    SSW = 'SSW',
    Reg60 = 'NB REG 60',
    AddressChange = 'Address Change',
    ReReg = 'ReReg',
    Suitability = 'Suitability',
    SuitabilityReview = 'SuitabilityReview',
}

export enum CaseMetricType {
    Retention = 'Retention',
    Attrition = 'Attrition',
}

export enum Processes {
    NewBusiness = 'New Business',
    Renewal = 'Renewal',
    Withdrawal = 'Withdrawal',
    Correspondence = 'Correspondence',
    Redemption = 'Redemption',
    RequiredMinimumDistribution = 'Required Minimum Distribution',
    OutgoingFundTransfer = 'Outgoing Fund Transfer',
    SSW = 'Systematic Program Update',
    AddressChange = 'Address Change',
    ReReg = 'ReReg',
    BeneficiaryChange = 'Beneficiary Change',
    PolicyUpdate = 'Policy Update',
    OneTimePremium = 'One Time Premium',
    Loan = 'Loan',
    LoanRepaymentOneTime = 'Loan Repayment One Time',
    Suitability = 'Suitability',
    SuitabilityReview = 'Suitability Review',
    QCD = 'Qualified Charitable Distribution',
    FundManagement = 'Fund Management',
    FundTransfer = 'Fund Transfer',
    FundAllocation = 'Fund Allocation',
    CancelAutoPay = 'CancelAutoPay',
    BeneficiaryUpdate = 'Beneficiary Update',
    AgentOnboarding = 'Agent Onboarding',
    QualityAudit = 'Quality Audit',
    OwnerChange = 'Owner Change',
    PayorChange = 'Payor Change',
    ThirdPartyDesigneeChange = 'Third Party Designee Change',
    ExistingNameChange = 'Existing Name Change',
    EmailChange = 'Email Change',
    PhoneNumberChange = 'Phone Change',
    BankChange = 'Bank Info Change',
    CommunicationPreferenceChange = 'Communication Preference Change',
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    SystematicProgramUpdate = 'Systematic Program Update',
    SystematicProgramSetup = 'Systematic Program Setup',
    SetupPayment = 'Setup Payment',
    UpdatePayment = 'Update Payment',
    SetupWithdrawal = 'Setup Withdrawal',
    UpdateWithdrawal = 'Update Withdrawal',
    SetupRequiredMinimumDistribution = 'Setup Required Minimum Distribution',
    UpdateRequiredMinimumDistribution = 'Update Required Minimum Distribution',
    UpdateLoanRepayment = 'Update Loan Repayment',
    SetupLoanRepayment = 'Setup Loan Repayment',
    FreeLookCancellation = 'Free Look Cancellation',
    PartialWithdrawal = 'Partial Withdrawal',
    FullSurrender = 'Full Surrender',
    InitialPremium = 'Initial Premium',
    Claims = 'Claims',
    AgentDelegatoin = 'Agent Delegation',
    DeathAudit = 'Death Audit',
    Matching = 'Matching',
    Reconciliation = 'Reconciliation',
    OperationsReview = 'Operations Review',
    AssigneeChange = 'Assignee Change',
}

export enum Actions {
    ReadOnly = 'readonly',
    Duplicate = 'duplicate',
    New = 'new',
}

export enum Statuses {
    InProgress = 'IN_PROGRESS',
    Exception = 'EXCEPTION',
    Completed = 'COMPLETED',
    NotStarted = 'NOT_STARTED',
    Canceled = 'CANCELED',
    New = 'NEW',
    Overridden = 'OVERRIDDEN',
    Withdrawn = 'WITHDRAWN',
    Inprogress = 'INPROGRESS',
    Pending = 'IMPEDED',
    Resolved = 'RESOLVED',
    Unresolved = 'UNRESOLVED',
    All = 'All',
    Issued = 'Issued', // NOTE: API response current returns Titlecase instead of ALLCAPS - MR
}

export interface StatCount {
    attribute: string;
    counts: [
        {
            label: string;
            value: number;
        }
    ];
}

export interface CaseStatsResponse {
    count: number;
    stats: StatCount[];
}

export interface CaseStatsErrorResponse {
    data: {
        err: string;
    };
    status: number;
}

/**
 * The response object returned by the {@link getCaseDashboardStats} endpoint.
 */
export interface CaseDashboardStatsResponse {
    /**
     * Array of elements that contain the stats, example:
     * see {@link DashboardSearchRequest} for more details.
     *
     */
    data?: DashboardStatsElementResponse[];
    totalElements: number;
}

export interface DashboardStatsElementResponse {
    /**
     * The count of occurences that match the filter
     */
    count: number;
    /**
     * The @see {@link GroupByOptions} passed from the request
     */
    key: string;
    /**
     * The name of the label that matches the value of the GroupBy parameter
     * @see {@link Case} for field names
     */
    name: string;
    /**
     * Array of elements that contain the stats, example:
     * see {@link DashboardStatsElementResponse} for more details.
     */
    values?: DashboardStatsElementResponse[];
}

export interface CaseDashboardStatsErrorResponse {
    data: {
        err: string;
    };
    status: number;
}

export interface CreateCaseBody {
    identifiers: IdentifierInstance[];
    carrier?: string;
    process?: string;
}

interface AdditionalData {
    policyNumber: string;
    requestSubType: string;
    owners: CaseOwner[];
}

export interface CreateCaseResponse {
    id: string;
    templateId: string;
    carrier: string;
    policyNumber: string;
    process: string;
    parentInstanceId: string;
    caseStatus: string;
    stages: StageInstance[];
    exceptions: ExceptionInstance[];
    parties: PartyInstance[];
    additionalData: AdditionalData;
    identifiers: IdentifierInstance[];
    createdAt: string;
    updatedAt: string;
}

export type Metadata = {
    stages: {
        [key: string]: {
            steps: { [key: string]: { info: string } };
        };
    };
};

export interface CaseReferenceResponse {
    referenceData: {
        requestSubType: string[];
        productName: string[];
        processList: string[];
    };
}

export type ProcessReferenceItem = {
    type: string;
    key: string;
    value: string;
    parentKey?: string;
};
export type ProcessReferenceData = ProcessReferenceItem & {
    child?: ProcessReferenceItem[];
};

export interface Nigo {
    createdDate: string | null;
    createdBy: string | null;
    category: string | null;
    reason: string | null;
    detailedReason: string | null;
    status: string;
    resolutionDate: string | null;
    resolution: string | null;
    nigoId: string;
}

export interface OnbaseCase {
    caseID: number;
    createdBy: string | null;
    createdDate: string | null;
    documentNumber: string;
    status: string | null;
    queueName: string | null;
    contractNum: string;
    noteCount: number;
    taskCount: number;
    nigoCount: number;
    attachmentCount: number;
    nigos: Nigo[];
}

export enum AgingTimeframes {
    ThreeDays = 'threeDays',
    FiveDays = 'fiveDays',
    SevenDays = 'sevenDays',
    FourteenDays = 'fourteenDays',
    ThirtyDays = 'thirtyDays',
    SixtyDays = 'sixtyDays',
    NinetyDays = 'ninetyDays',
}
export enum AgingTimeRanges {
    ZeroToSeven = '0-7',
    EightToFourteen = '8-14',
    FifteenToThirty = '15-30',
    ThirtyOneToFortyFive = '31-45',
    FortySixToFiftyNine = '46-59',
    SixtyPlus = '60+',
}

export type AgingTimeRangesKeys = keyof typeof AgingTimeRanges;
export type AgingTimeRangesKeysExtended = keyof typeof AgingTimeRanges | 'All';

export enum CorrectionType {
    Licensing = 'Licensing',
    Financial = 'Financial',
    Tax = 'Tax',
    NonFinancial = 'Non-Financial',
    Death = 'Death',
    Maturity = 'Maturity',
}

export enum CorrectionReason {
    ComplianceRequirementChange = 'Compliance requirement change',
    CustomerCorrectionRequest = 'Customer correction request',
    DataEntryError = 'Data entry error',
    DeathEventDetailsIncorrect = 'Death event details incorrect',
    DocumentationMissingOrInvalid = 'Documentation missing/invalid',
    MaturityEventIncorrect = 'Maturity event incorrect',
    OnboardingDataIncorrect = 'Onboarding data incorrect',
    SubmittedVsProcessedMismatch = 'Submitted vs. processed mismatch',
    SystemError = 'System error',
}

export enum LOADING_TIME_CONFIG {
    NO_MESSAGE_THRESHOLD = 500,
    GATHERING_THRESHOLD = 2000,
    ORGANIZING_THRESHOLD = 5000,
}
const BADGE_EXCLUDED_STATUSES = new Set([
    Statuses.Completed,
    Statuses.Canceled,
]);
export const shouldShowEscalationBadge = (
    escalated: boolean,
    status: Statuses
): boolean => escalated && !BADGE_EXCLUDED_STATUSES.has(status);

export enum QualityAuditStatus {
    QA_CASE_ALREADY_EXISTS = 'QA_CASE_ALREADY_EXISTS',
    QA_CASE_CREATED = 'QA_CASE_CREATED',
}
