import { createContext } from 'react';

import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';

export type TaskState = {
    taskMetadata: FormMetadata;
    task: ManagementTask;
    setTask: React.Dispatch<React.SetStateAction<ManagementTask>>;
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const taskDefaultValues = {
    taskMetadata: {} as FormMetadata,
    task: {} as ManagementTask,
    setTask: noop,
};

export const TaskDataContext = createContext<TaskState>(taskDefaultValues);
