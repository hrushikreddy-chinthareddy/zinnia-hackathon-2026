export interface Task {
    id: string;
    taskName: string;
    status: string;
}

export interface TaskTableRow {
    taskId: string;
    taskInfoLink: string;
    status: string;
    taskName: string;
    statusDuration: string;
    actions: string;
}

export interface TasksListingProps {
    tasks: Task[];
    caseId: string;
    caseType: string;
    documentNumber: string;
    clientId: string;
    config: any;
}
