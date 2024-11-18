import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { ForwardedRef, useCallback, useContext } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { processDocuments } from '@deps/containers/task-container/task.healpers';

type TaskFormProps = {
    readonly: boolean;
    onSubmit: () => void;
    isSubmit?: boolean;
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    { readonly, onSubmit, isSubmit }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const formState = useContext(TaskDataContext);
    const { task, setTask, taskMetadata } = formState;

    const handleSubmit = useCallback(() => {
        if (isSubmit) {
            const success = processDocuments(task);
            if (!success) {
                console.log('Error occured during EDS files upload');
            }
        }
        onSubmit();
    }, [isSubmit, onSubmit, task]);

    const handleChange = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            setTask({
                ...task,
                data: event.formData,
            });
        },
        [setTask, task]
    );

    return (
        <DynamicForm
            ref={forwardedRef}
            formData={task.data}
            taskMetadata={taskMetadata}
            onChange={handleChange}
            onSubmit={handleSubmit}
            readonly={readonly}
        ></DynamicForm>
    );
});
