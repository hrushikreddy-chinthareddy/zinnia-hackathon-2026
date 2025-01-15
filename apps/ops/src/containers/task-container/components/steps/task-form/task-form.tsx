import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { ForwardedRef, useCallback, useContext } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.healpers';
import { FormMetadata } from '@deps/models/case/task';
import { buildTaskPayload } from '@deps/utils/tasks/task-payload-helper';

type TaskFormProps = {
    readonly: boolean;
    onSubmit: () => void;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    { readonly, onSubmit, isSubmit, taskMetadata }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const formState = useContext(TaskDataContext);
    const { task, setTask, setSubmitFailed, correlationId } = formState;

    const handleSubmit = useCallback(async () => {
        if (isSubmit) {
            //todo:vijaya: payload customization

            const taskPayload = buildTaskPayload(task);

            const success = await updateTask(taskPayload, correlationId);
            setSubmitFailed(!success);
        }
        onSubmit();
    }, [correlationId, isSubmit, onSubmit, setSubmitFailed, task]);

    const handleChange = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            setTask({
                ...task,

                data: event.formData,
            });
        },

        [setTask, task]
    );

    const handleFormDataChange = (data: any) => {
        setTask({
            ...task,
            data: data,
        });
    };

    return (
        <DynamicForm
            ref={forwardedRef}
            formData={task.data}
            setFormData={handleFormDataChange}
            taskMetadata={taskMetadata}
            onChange={handleChange}
            onSubmit={handleSubmit}
            readonly={readonly}
        ></DynamicForm>
    );
});
