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

export type Case = {
    additionalData: AdditionalDataInstance;
    applicationType?: string;
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
    FundTransfer = 'Fund Management',
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
