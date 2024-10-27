import { useCallback, useContext } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TaskDataContext } from '@deps/containers/task-container/task-context';

type TaskFormProps = {
    isSummaryView?: boolean;
};
export const TaskForm = ({ isSummaryView = false }: TaskFormProps) => {
    const formState = useContext(TaskDataContext);
    const { formData, setFormData, formSchema, uiSchema, formRef } = formState;

    const handleSubmit = useCallback(({ formData, errors, schema }: any) => {
        console.log('Submitted data:', formData);
        console.log('Errors:', errors);
        console.log('Schema:', schema);
    }, []);

    const handleChange = useCallback(() => {
        setFormData(formData);
    }, [formData, setFormData]);

    return (
        <DynamicForm
            formData={formData.data}
            formSchema={formSchema}
            uiSchema={uiSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            ref={formRef}
            disabled={isSummaryView}
        ></DynamicForm>
    );
};
