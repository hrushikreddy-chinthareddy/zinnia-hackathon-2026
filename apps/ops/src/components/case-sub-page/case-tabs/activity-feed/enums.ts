export enum FeedAction {
    CREATED = 'CREATED',
    ADDED = 'ADDED',
    STATUS_CHANGE = 'STATUS_CHANGE',
    ASSIGNMENT = 'ASSIGNMENT',
    UNASSIGNMENT = 'UNASSIGNMENT',
    PRIORITIZED = 'PRIORITIZED',
    DEPRIORITIZED = 'DEPRIORITIZED',
    UPDATED = 'UPDATED',
}

export enum FeedStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    INPROGRESS = 'INPROGRESS',
    EXCEPTION = 'EXCEPTION',
    COMPLETED = 'COMPLETED',
    NEW = 'NEW',
    RESOLVED = 'RESOLVED',
}

export enum EntityType {
    CASE = 'CASE',
    NOTE = 'NOTE',
    DOCUMENT = 'DOCUMENT',
    STEP = 'STEP',
    STAGE = 'STAGE',
    TASK = 'TASK',
}

export enum EntityLabel {
    CASE = 'Case',
    NOTE = 'Note',
    DOCUMENT = 'Document',
    STEP = 'Step',
    STAGE = 'Stage',
    TASK = 'Task',
    EXCEPTION = 'Exception',
}
