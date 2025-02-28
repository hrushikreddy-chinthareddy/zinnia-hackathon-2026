import { RJSFSchema, UiSchema } from '@rjsf/utils';

import { Reg60FormData } from '@deps/containers/otp/reg60-forms/reg60.types';

import { Channel } from './renewal/case-renewal';
import { ActiveWithdrawalCase, ActiveWithdrawalCaseData } from './withdrawal/case';

export enum TaskType {
    Withdrawal = 'WithdrawalFormInputTask',
    OFT = 'OFTFormInputTask',
    RMD = 'RMDFormInputTask',
    SSW = 'SSWFormInputTask',
    RENEWAL = 'RenewalTask',
    REG60 = 'NBReg60Comparision',
    SuitabilityDataEntry = 'SUITABILITY_DATA_ENTRY',
    SuitabilityReview = 'SUITABILITY_REVIEW',
    PURCHASE_DOCUMENT_MATCHING = 'PURCHASE_DOCUMENT_MATCHING',
    Agent_Nigo = 'NB_AGENT_NIGO',
    Application_Nigo = 'NB_APPLICATION_NIGO',
    Standard_Document_Matching = "STANDARD_DOCUMENT_MATCHING",
    PremiumNigo = 'NB_PAYMENT_PROCESSING_NIGO',
    Agent_Review = 'NB_AGENT_REVIEW',
    Review_Ofac = 'OFAC_REVIEW'
}

export enum EarlyTaskType {
    Withdrawal = 'WithdrawalFormInputTask',
    OFT = 'OFTFormInputTask',
    RMD = 'RMDFormInputTask',
    SSW = 'SSWFormInputTask',
    RENEWAL = 'RenewalTask',
    REG60 = 'NBReg60Comparision',
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
    source: string;
    contractNum: string;
    contractValue?: number | string | null;
    channel: string;
    userId: string;
    lob: string;
    onbaseCaseId: string;
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
export type TaskV2Payload = Reg60FormData | ActiveWithdrawalCaseData;

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

export type FormMetadata = {
    title?: string;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    schemaContent?: {
        tabSchemas: [
            {
                title?: string;
                formSchema: RJSFSchema;
                uiSchema: UiSchema;
            }
        ];
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

export enum DataFormattingTypes {
    SSN = 'ssn',
    Date = 'date',
    Amount = 'amount',
}
