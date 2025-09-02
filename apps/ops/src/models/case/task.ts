import { RJSFSchema, UiSchema } from '@rjsf/utils';

import { Reg60FormData } from '@deps/containers/otp/reg60-forms/reg60.types';

import { Channel } from './renewal/case-renewal';
import {
    ActiveWithdrawalCase,
    ActiveWithdrawalCaseData,
} from './withdrawal/case';
export const INTERVAL = 3000;

export enum CaseIdentifierType {
    ZL_CASE_ID = 'zlCaseId',
}

export enum TaskType {
    Withdrawal = 'WithdrawalFormInputTask',
    OFT = 'OFTFormInputTask',
    RMD = 'RMDFormInputTask',
    SSW = 'SSWFormInputTask',
    RENEWAL = 'RenewalTask',
    RENEWAL_TASK = 'RENEWAL_TASK',
    REG60 = 'NBReg60Comparision',
    SuitabilityDataEntry = 'SUITABILITY_DATA_ENTRY',
    SuitabilityReview = 'SUITABILITY_REVIEW',
    PURCHASE_DOCUMENT_MATCHING = 'PURCHASE_DOCUMENT_MATCHING',
    Agent_Nigo = 'NB_AGENT_NIGO',
    Attachment_Nigo = 'NB_ATTACHMENT_NIGO',
    PremiumNigo = 'NB_PAYMENT_PROCESSING_NIGO',
    Application_Nigo = 'NB_APPLICATION_NIGO',
    Agent_Review = 'NB_AGENT_REVIEW',
    AppDataEntry = 'NB_APP_DATA_ENTRY',
    Review_Ofac = 'OFAC_REVIEW',
    Agent_Onboarding_Nigo = 'AGENT_ONBOARDING_NIGO',
    TOA_Nigo = 'NB_TOA_NIGO',
    Standard_Document_Matching = 'STANDARD_DOCUMENT_MATCHING',
    Application_Review = 'NB_APPLICATION_REVIEW',
    Prenote_Nigo = 'NB_PRENOTE_NIGO',
    Agent_Onboarding_Review = 'AGENT_ONBOARDING_REVIEW',
    ReturnPayment = 'NB_PAYMENT_CANCEL',
    Send_Nigo_Communication = 'SEND_NIGO_COMMUNICATION',
    Initiate_Postissue_Transaction = 'INITIATE_POSTISSUE_TRANSACTION',
    TOA_Review = 'NB_TOA_REVIEW',
    Prenote_Review = 'NB_PRENOTE_REVIEW',
    Payment_Processing_Review = 'NB_PAYMENT_PROCESSING_REVIEW',
    Duplicate_Review = 'NB_DUPLICATE_REVIEW',
    Payment_Follow_Up = 'NB_PAYMENT_FOLLOW_UP',
    Suitaibility_DataEntry_Nigo_Review = 'SUITABILITY_DATAENTRY_NIGO_REVIEW',
    Claims_Stop_Uncashed_Transactions = 'CLAIMS_STOP_UNCASHED_TRANSACTIONS',
    Claims_Identify_Uncashed_Transactions = 'CLAIMS_IDENTIFY_UNCASHED_TRANSACTIONS',
    Claims_Reverse_Uncashed_Transactions = 'CLAIMS_REVERSE_UNCASHED_TRANSACTIONS',
    Claims_Match_Bene_Document = 'CLAIMS_MATCH_BENE_DOCUMENT',
    Background_Nigo = 'BACKGROUND_NIGO',
    Background_Review = 'BACKGROUND_REVIEW',
    Purchase_enrichment = 'NB_PURCHASE_ENRICHMENT',
    Cost_Basis_Review = 'NB_COST_BASIS_REVIEW',
    Claims_Fi_Escheatment_Task = 'CLAIMS_FI_ESCHEATMENT_TASK',
    Bene_Address_Verification = 'BENE_ADDRESS_VERIFICATION',
    Claims_Bene_Review = 'CLAIMS_BENE_REVIEW',
    Day_150_Review = 'DAY_150_REVIEW',
    Bene_Call = 'BENE_CALL',
    Ops_Nigo = 'OPS_NIGO',
    Ops_Review = 'OPS_REVIEW',
    Default_Case_DataEntry = 'DEFAULT_CASE_DATA_ENTRY',
    Policyupdate_Partydetails_Review = 'POLICYUPDATE_PARTYDETAILS_REVIEW',
    Update_Suitability_DataEntry = 'UPDATE_SUITABILITY_DATA_ENTRY',
    Initiate_BeneChange_Transaction = 'INITIATE_BENECHANGE_TRANSACTION',
}

export enum EarlyTaskType {
    Withdrawal = 'WithdrawalFormInputTask',
    OFT = 'OFTFormInputTask',
    RMD = 'RMDFormInputTask',
    SSW = 'SSWFormInputTask',
    RENEWAL = 'RenewalTask',
    REG60 = 'NBReg60Comparision',
    RENEWAL_TASK = 'RENEWAL_TASK',
}

export enum TaskToProcessType {
    OFTFORMINPUTTASK = 'OFT',
    SSWFORMINPUTTASK = 'SSW',
    WITHDRAWALFORMINPUTTASK = 'WITHDRAWAL',
    RMDFORMINPUTTASK = 'RMD',
    RENEWAL_TASK = 'RENEWAL_TASK',
    RENEWALTASK = 'RenewalTask',
}

export enum TaskSource {
    ZinniaTaskManagement = 'Zinnia.TaskManagement',
}

export enum MessageType {
    Default = 'default',
    Success = 'success',
    Info = 'info',
    Error = 'error',
}

export interface Signature {
    signaturePresent: string;
    type: string | null;
    isValidDate: boolean;
    signDate: string | null;
    name: string | null;
    title: string | null;
}

export interface OwnerInformation {
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    fullName: string | null;
    type: string;
    signature: Signature;
}

export interface RenewalsFormData {
    documentNumber: string;
    caseId?: string;
    source: string;
    contractNum: string;
    contractValue?: number | string | null;
    channel: string;
    userId: string;
    lob: string;
    onbaseCaseId: string;
    obPendTaskId?: string | null;
    productName: string;
    clientCode: string;
    taskType: string;
    documentReceivedDate: string;
    goodOrderDate: string;
    renewalRequestSignDate: string;
    ownerInformation: OwnerInformation[];
    subsequentGuaranteePeriod: null;
    subsequentTargetFunds: TargetFundAllocation[] | null;
    transOption: string | null;
}

export interface TargetFundAllocation {
    fundName: string;
    value: string | null;
    divisionCode?: string;
    sourceFundName?: string;
    fundCode?: string;
}

export interface CreateTaskBody<TaskStatus, K> {
    source?: string;
    taskType: string;
    status?: TaskStatus;
    data: K;
    carrier?: string;
}

export type TaskV1Payload = RenewalsFormData | ActiveWithdrawalCase;
export type TaskV2Payload =
    | Reg60FormData
    | ActiveWithdrawalCaseData
    | RenewalsFormData;

export interface CreateTaskResponse {
    id: string;
    taskId: string;
    caseId: string;
    taskType: string;
    status: string;
    source: string;
    carrier: string;
    assignedTo: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    updatedBy: string;
    data: any;
}

export interface renewalsFormParts {
    channel: Channel;
    ownerInformation: OwnerInformation[];
    renewalRequestSignDate: string;
    subsequentTargetFunds: TargetFundAllocation[] | null;
}
export type TabSchema = {
    title?: string;
    description?: string;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
};

export type FormMetadata = TabSchema & {
    schemaContent?: {
        tabSchemas: TabSchema[];
    };
};

export enum CardTypes {
    Detailed = 'Detailed',
    Hyperlink = 'Hyperlink',
    Download = 'Download',
    Preview = 'Preview',
    Document = 'Document',
}

export enum ApiResponseTypes {
    FormData = 'formData',
    Schema = 'schema',
}

export type ApiProps = {
    apiUrl: string;
    apiMethod: 'get' | 'post';
    apiBody: any;
    apiHeaders: any;
    apiResponse: any;
    apiError: any;
    dataKey: string;
    apiPayload: any;
    responseData: string;
    response: {
        enum: string;
        enumNames: string;
    };
    responseType: ApiResponseTypes;
};

export enum EventType {
    onChange = 'onChange',
    onBlur = 'onBlur',
}

export type TaskEventProps = {
    taskEventType: EventType;
    responseData: string;
    dataKey: string;
    responseType: ApiResponseTypes;
};
export enum DataFormattingTypes {
    SSN = 'ssn',
    Date = 'date',
    Amount = 'amount',
    DirtyAddress = 'dirtyAddress',
    Button = 'button',
    RelationshipToInsured = 'relationshipToInsured',
    TitleCase = 'titleCase',
    Percentage = 'percentage',
    Phone = 'phone',
}

export interface AddressFormFields {
    addressType?: string;
    addresses?: any[];
    city?: string;
    state?: string;
    zip?: string;
    zipCode?: string;
    country?: string;
    defaultAddress?: boolean;
    addressLines?: any[];
}
export interface ExceptionRef {
    carrier: string;

    process: string;
    subProcess: string;
    subNmIdDetail: string;

    subNmId: string;
}

export enum TaskFieldTypes {
    Form = 'form',
    AdditionalInfo = 'additionInfo',
    Title = 'title',
    Subtitle = 'subTitle',
    hidden = 'hidden',
}

export enum ActionTypes {
    Add = 'ADD',
    Remove = 'REMOVE',
}
