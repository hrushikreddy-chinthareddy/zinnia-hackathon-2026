import { AssignedTask, UnassignedTask } from '@deps/models/case/task-instance';

export type ColumnId =
    | 'linkSpacer'
    | 'task'
    | 'status'
    | 'carrierCase'
    | 'assignee'
    | 'createdAt'
    | 'updatedAt'
    | 'policyNumber'
    | 'scheduledDate';

export type Column<T> = {
    id: ColumnId;
    label: string;
    defaultVisible?: boolean;
    locked?: boolean;
    requiresIdentifiers?: string[];
    accessor?: (row: T) => any;
};

export const TASK_COLUMNS: Column<AssignedTask | UnassignedTask>[] = [
    // permanent
    {
        id: 'task',
        label: 'taskManagementQueue.task',
        defaultVisible: true,
        locked: true,
    },
    {
        id: 'status',
        label: 'taskManagementQueue.status',
        defaultVisible: true,
        locked: true,
    },

    // toggleable
    {
        id: 'carrierCase',
        label: 'taskManagementQueue.carrierCase',
        defaultVisible: true,
    },
    {
        id: 'assignee',
        label: 'taskManagementQueue.assignee',
        defaultVisible: true,
    },
    {
        id: 'createdAt',
        label: 'taskManagementQueue.created',
        defaultVisible: true,
    },
    {
        id: 'updatedAt',
        label: 'taskManagementQueue.lastUpdated',
        defaultVisible: true,
    },
    {
        id: 'policyNumber',
        label: 'allFields.policy',
        defaultVisible: false,
        requiresIdentifiers: ['policyNumber'],
    },
    {
        id: 'scheduledDate',
        label: 'allFields.scheduledDate',
        defaultVisible: false,
    },
];

export enum ColumnIds {
    Task = 'task',
    Status = 'status',
    CreatedAt = 'createdAt',
}
