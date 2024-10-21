import Form from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { createContext, createRef, RefObject } from 'react';

export type TaskState = {
    formRef: RefObject<Form<any, RJSFSchema, any>>;
    formData: any;
    setFormData: any;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
};

export const taskDefaultValues = {
    formRef: createRef<Form>(),
    formData: {},
    setFormData: () => {},
    formSchema: {},
    uiSchema: {},
};

export const TaskDataContext = createContext<TaskState>(taskDefaultValues);
