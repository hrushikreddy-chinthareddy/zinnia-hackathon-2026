import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { ForwardedRef, useCallback, useContext } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { processDocuments } from '@deps/containers/task-container/task.healpers';

type TaskFormProps = {
    isSummaryView?: boolean;
    onSubmit: () => void;
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    { isSummaryView, onSubmit }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const formState = useContext(TaskDataContext);
    const { formData, setFormData, formSchema, uiSchema } = formState;

    const handleSubmit = useCallback(
        (data: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            processDocuments(data.formData);
            setFormData(data.formData);
            onSubmit();
        },
        [onSubmit, setFormData]
    );

    const handleChange = useCallback(() => {
        setFormData(formData);
    }, [formData, setFormData]);

    return (
        <DynamicForm
            formData={formData}
            formSchema={formSchema}
            uiSchema={uiSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            ref={forwardedRef}
            isSummaryView={isSummaryView}
        ></DynamicForm>
    );
});
