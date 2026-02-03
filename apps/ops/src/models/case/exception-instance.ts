import { AdditionalDataInstance } from './additional-data-instance';

export enum ExceptionStatuses {
    New = 'NEW',
    Resolved = 'RESOLVED',
    Overridden = 'OVERRIDDEN',
}

export enum ExceptionStatusLabels {
    New = 'In Progress',
    Resolved = 'Resolved',
}

export type ExceptionAdditionalDataItem = {
    id: string;
    label: string;
    value: string;
    dataType: string;
    entityType: string;
    source: string;
};

export type ExceptionInstance = {
    additionalData?: AdditionalDataInstance;
    exceptionAdditionalData?: ExceptionAdditionalDataItem[];
    category: string;
    createdAt?: string; // TODO - This doesn't seem to exist any more.  Update once new contract comes out?
    detailedReason: string;
    processingReason?: string;
    eventRef?: string[];
    id: string;
    mappedTasks?: string[];
    exceptionRefId?: string;
    reason: string;
    status: ExceptionStatuses;
    exceptionType?: string;
    taskIdList?: string[];
    updatedAt: string;
};
