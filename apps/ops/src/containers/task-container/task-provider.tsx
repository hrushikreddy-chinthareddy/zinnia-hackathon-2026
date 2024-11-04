import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { useContext, useState } from 'react';

import { TaskDataContext } from './task-context';

type TaskProviderProps = {
    children: React.ReactNode;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    taskData: any;
};

export const TaskProvider = ({ children, formSchema, uiSchema, taskData }: TaskProviderProps) => {
    const [formData, setFormData] = useState(taskData);
    return <TaskDataContext.Provider value={{ formData, setFormData, formSchema, uiSchema }}>{children}</TaskDataContext.Provider>;
};

export const useTask = () => {
    const context = useContext(TaskDataContext);

    if (!context) {
        throw new Error('context is not defined within a TaskProvider');
    }
    return context;
};
