import { AdditionalDataInstance } from './additional-data-instance';
import { IdentifierInstance } from './identifier-instance';

/**
 * open, closed are statuses
 * for read-only purpose.
 * NEW, COMPLETED to be used to
 * change server state.
 */
export enum TaskStatus {
    'Open' = 'Open',
    'Closed' = 'Closed',
    'Completed' = 'COMPLETED',
    'New' = 'NEW',
    'InProgress' = 'INPROGRESS',
}

export type TaskInstance = {
    additionalData: AdditionalDataInstance;
    assignee: string;
    createdAt: string;
    eventRef: string[];
    externalTaskId?: string;
    id: string;
    label: string | null;
    mappedNotes: string[];
    notesIdList: string[];
    status: TaskStatus;
    taskType: string;
    updatedAt: string;
};
export type ManagementTask<T = TaskStatus> = {
    assignedTo?: any;
    carrier: string;
    caseId: string;
    createdAt: string;
    id: string;
    process: string;
    queue: null;
    status: T;
    taskName: string;
    taskType: string;
    updatedAt: string;
    data: any;
    documents: TaskDocument[];
};

export type TaskDocument = {
    documentId: string;
    documentName: string;
    documentSource: DocumentSource;
    fileType: string;
};

export enum DocumentSource {
    Working = 'Working',
    Related = 'Related',
}

export type TaskComment = {
    comment?: string | null;
    commentCategory?: string | null;
    commentDetail?: string | null;
    commentSubCategory?: string | null;
    createBy?: string | null;
    description?: string | null;
    noteId?: number | null;
    submissionDate?: string | null;
};

export type AssignedTask<T = TaskStatus> = {
    id: string;
    caseId: string;
    source: string;
    templateId: string;
    process: string;
    carrier: string;
    taskType: string;
    taskName: string;
    status: T;
    queue: string;
    escalated: boolean;
    assignee: string;
    assigneePartyId: string;
    assignedAt: string;
    createdBy: string;
    createdByPartyId: string;
    createdAt: string;
    updatedBy: string;
    updatedByPartyId: string;
    updatedAt: string;
    identifiers: IdentifierInstance[];
};
