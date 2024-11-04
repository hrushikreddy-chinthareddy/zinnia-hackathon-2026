import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { createContext } from 'react';

export type TaskState = {
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    formData: any;
    setFormData: any;
};

export const taskDefaultValues = {
    setFormData: () => {},
    formSchema: {},
    uiSchema: {},
    formData: {},
};

export const TaskDataContext = createContext<TaskState>(taskDefaultValues);
