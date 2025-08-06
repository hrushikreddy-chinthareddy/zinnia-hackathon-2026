import { ColDef } from 'ag-grid-community';
import { TFunction } from 'next-i18next';

export interface Task {
    id: string;
    taskName: string;
    status: string;
    userId: string;
    createdDate: string;
    updatedDate: string;
    taskType: string;
}

export interface TaskTableRow {
    taskId: string;
    taskInfoLink: string;
    taskStatus: string;
    status: string;
    taskName: string;
    statusDuration: string;
    taskDate: string;
    userId: string;
    taskType: string;
}

export interface NoTaskFoundLabels {
    createNewTask: string;
    noTasksFoundTitle: string;
    noTasksMessage: string;
}

export interface TaskListingConfig {
    searchResults: string;
    createNewTask: string;
    taskTableColConfig: ColDef<any>[];
    noTaskFound: NoTaskFoundLabels;
}

export interface TasksListingProps {
    t: TFunction;
    isHeaderHidden?: boolean;
    isTaskCreationSupported?: boolean;
    tasks: Task[] | undefined;
    caseId: string;
    caseType: string;
    documentNumber: string;
    clientId: string;
    config: any;
}

export interface TasksTableProps {
    t: TFunction;
    tasks: TaskTableRow[] | undefined;
    config: any;
}
