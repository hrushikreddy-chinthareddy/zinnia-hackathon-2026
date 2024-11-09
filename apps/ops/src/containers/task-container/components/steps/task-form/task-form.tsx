import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { ForwardedRef, useCallback, useContext } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { processDocuments } from '@deps/containers/task-container/task.healpers';

type TaskFormProps = {
    readonly?: boolean;
    onSubmit: () => void;
    isSubmit?: boolean;
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    { readonly, onSubmit, isSubmit }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const formState = useContext(TaskDataContext);
    const { formData, setFormData, formSchema, uiSchema } = formState;

    const handleSubmit = useCallback(
        (data: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            if (isSubmit) {
                processDocuments(data.formData);
            }
            onSubmit();
        },
        [isSubmit, onSubmit]
    );

    const handleChange = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            setFormData(event.formData);
        },
        [setFormData]
    );

    return (
        <DynamicForm
            formData={formData}
            formSchema={formSchema}
            uiSchema={uiSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            ref={forwardedRef}
            readonly={readonly}
        ></DynamicForm>
    );
});
