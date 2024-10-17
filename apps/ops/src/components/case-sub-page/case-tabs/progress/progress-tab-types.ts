import { ExceptionStatuses } from '@deps/models/case/exception-instance';
export type TaskView = {
    createdAt: string;
    description: string;
    id: string;
    hasParentException: boolean;
    parentExceptionStatus?: ExceptionStatuses | null;
    status: string;
    updatedAt: string; // Zahara API date String
};

export type ExceptionView = {
    createdAt?: string;
    description: string;
    id: string;
    tasks: TaskView[];
    status: string;
    updatedAt: string;
};

export type CaseAdditionalData = {
    [key: string]: { label: string; value: string; type: string };
};
