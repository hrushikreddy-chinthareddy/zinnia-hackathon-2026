import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

export enum DeathAuditFileTypes {
    INBOUND = 'inbound',
    OUTBOUND = 'outbound',
}

export enum DeathAuditCaseFileTypes {
    MATCHED_CASES_FILE = 'matchedCasesFile',
    CANCELLED_CASES_FILE = 'cancelledCasesFile',
    INBOUND_CASES_FILE = 'inboundCasesFile',
}

export interface DeathAuditFileProcessingProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
    prop: string;
    title: string;
    objectKey?: string;
}

export interface AuditFile {
    documentId: string;
    fileName: string;
    fileRecordCount?: number;
    createdTimestamp?: string;
    receivedTimestamp?: string;
}

export interface AuditSummaryItem {
    value: number | string;
    label: string;
}

export interface AuditDetailsResponse {
    files: AuditFile[];
    summary: AuditSummaryItem[];
}

export interface DeathAuditSummaryItem {
    totalRecordCount: number;
    cancelledRecordCount?: number;
    existingCaseCount?: number;
    newCaseCount?: number;
}

export interface InboundFileComplianceData {
    fileName: string;
    fileReceivedDate: string;
}

export interface AuditFileItem {
    file?: AuditFile;
    matchedCasesFile?: AuditFile;
    inboundFileComplianceData?: InboundFileComplianceData;
    cancelledCasesFile?: AuditFile;
    inboundFileData?: InboundFileData;
    fileProcessingStatus?: string;
    inboundCasesFile?: AuditFile;
    inboundRecordId?: string;
    summary?: DeathAuditSummaryItem;
    fileRecords?: any[]; // Its a dump from 3rd party system, structure unknown
}

export interface InboundFileData {
    ChildEventEndId: string;
    ChildEventStartId: string;
    correlationid: string;
    documentId: string;
    failedRecords: string;
    fileBatchId: string;
    fileName: string;
    fileReceivedDate: string;
    successfulRecords: string;
    totalRecords: string;
}
