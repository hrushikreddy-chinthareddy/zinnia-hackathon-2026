import { ExceptionStatuses } from '@deps/models/case/exception-instance';
export type TaskView = {
    createdAt: string;
    description: string;
    id: string;
    hasParentException: boolean;
    parentExceptionStatus?: ExceptionStatuses | null;
    status: string;
    updatedAt: string;
    taskName?: string;
};

export type ExceptionView = {
    createdAt?: string;
    description: string;
    id: string;
    exceptionRefId?: string;
    tasks: TaskView[];
    status: string;
    updatedAt: string;
};

export type CaseAdditionalData = {
    [key: string]: { label: string; value: string; type: string };
};

export interface GroupedExceptions {
    [taskId: string]: { tasks: TaskView[]; exceptions: ExceptionView[] };
}
