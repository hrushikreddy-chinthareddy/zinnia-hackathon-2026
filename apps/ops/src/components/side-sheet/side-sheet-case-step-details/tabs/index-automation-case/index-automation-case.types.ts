import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

export enum DataType {
    REQUEST_RECEIVED_DATA = 'REQUEST_RECEIVED_DATA',
    DOCUMENT_IDENTIFICATION_DATA = 'DOCUMENT_IDENTIFICATION_DATA',
    DOCUMENT_EXTRACTION_DATA = 'DOCUMENT_EXTRACTION_DATA',
    DOCUMENT_INDEXED_DATA = 'DOCUMENT_INDEXED_DATA',
    DOCUMENT_MANUAL_REVIEW_DATA = 'DOCUMENT_MANUAL_REVIEW_DATA',
}

export interface IndexAutomationCaseProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
    dataType: string;
}

export interface IndexAutomationCaseData {
    dataType: string;
}
