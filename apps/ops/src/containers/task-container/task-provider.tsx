import Form from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { createRef, useContext, useState } from 'react';

import { TaskDataContext } from './task-context';

type TaskProviderProps = {
    children: React.ReactNode;
    taskData: any;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    formRef: any;
};

export const TaskProvider = ({ children, taskData, formSchema, uiSchema }: TaskProviderProps) => {
    const [formRef] = useState(createRef<Form>());
    const [formData, setFormData] = useState(taskData);
    return <TaskDataContext.Provider value={{ formRef, formData, setFormData, formSchema, uiSchema }}>{children}</TaskDataContext.Provider>;
};

export const useTask = () => {
    const context = useContext(TaskDataContext);

    if (!context) {
        throw new Error('context is not defined within a TaskProvider');
    }
    return context;
};
