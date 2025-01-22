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
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
};
