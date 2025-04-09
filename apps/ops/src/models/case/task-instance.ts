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
    'Pending' = 'IMPEDED',
    'Canceled' = 'CANCELED',
}

export enum TaskLabel {
    'New' = 'To do',
    'Completed' = 'Completed',
    'Pending' = 'Pending',
    'Canceled' = 'Canceled',
    'InProgress' = 'In Progress',
    'Closed' = 'Closed',
}

export type TaskInstance = {
    taskName?: string;
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
    assigneeFirstName?: string;
    assigneeLastName?: string;
    carrier: string;
    caseId: string;
    createdAt: string;
    id: string;
    process: string;
    queue?: string | null;
    status: T;
    taskName: string;
    taskType: string;
    updatedAt: string;
    data: any;
    documents?: TaskDocument[];
    statusReason?: string;
    impededTillDate?: string;
    prefferedAssignee?: string;
    mappedDocuments?: TaskDocument[];
    additionalDocuments?: TaskDocument[];
    assignee?: string;
    impededReason?: string;
    cancellationReason?: string;
};

export type TaskDocument = {
    documentId: string;
    documentName: string;
    documentSource: DocumentSource;
    fileType?: string;
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
    user?: string | null;
    createdAt?: string | null;
    note?: string | null;
    title?: string | null;
    date?: string | null;
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

export type DocumentData = {
    documentId?: string;
    displayName?: string;
    documentSource?: string;
    fileType?: string;
    documentName?: string;
    documentNumber?: string;
    documentID?: string;
    sourceFileName?: string;
};

export interface TaskSideSheetProps {
    taskId: string;
    type?: string;
    taskDescription?: string;
    taskName?: string;
}

export interface TaskQueueDrawerProps {
    onClose: () => void;
    getTasks?: () => void;
    taskStatus: TaskStatus;
    taskId: string;
    taskDescription?: string;
    taskName?: string;
}

export type UnassignedTask<T = TaskStatus> = {
    id: string;
    caseId: string;
    process: string;
    carrier: string;
    taskType: string;
    taskName: string;
    status: T;
    assignee?: string;
    createdAt: string;
    identifiers: IdentifierInstance[];
};
