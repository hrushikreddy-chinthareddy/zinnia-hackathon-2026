import { useContext, useState } from 'react';

import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';

import { TaskDataContext } from './task-context';

type TaskProviderProps = {
    children: React.ReactNode;
    taskMetadata: FormMetadata;
    initialTask: ManagementTask;
};

export const TaskProvider = ({ children, initialTask, taskMetadata }: TaskProviderProps) => {
    const [task, setTask] = useState<ManagementTask>(initialTask);
    return <TaskDataContext.Provider value={{ task, setTask, taskMetadata }}>{children}</TaskDataContext.Provider>;
};

export const useTask = () => {
    const context = useContext(TaskDataContext);

    if (!context) {
        throw new Error('context is not defined within a TaskProvider');
    }
    return context;
};
