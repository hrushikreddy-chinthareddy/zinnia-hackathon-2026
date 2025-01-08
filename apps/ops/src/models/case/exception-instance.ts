import { AdditionalDataInstance } from './additional-data-instance';

export enum ExceptionStatuses {
    New = 'NEW',
    Resolved = 'RESOLVED',
    Overridden = 'OVERRIDDEN',
}

export type ExceptionInstance = {
    additionalData?: AdditionalDataInstance;
    category: string;
    createdAt?: string; // TODO - This doesn't seem to exist any more.  Update once new contract comes out?
    detailedReason: string;
    eventRef?: string[];
    id: string;
    mappedTasks?: string[];
    exceptionRefId?: string;
    reason: string;
    status: ExceptionStatuses;
    taskIdList?: string[];
    updatedAt: string;
};
