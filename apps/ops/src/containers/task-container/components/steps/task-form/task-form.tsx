import { useContext } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TaskDataContext } from '@deps/containers/task-container/task-context';

type TaskFormProps = {
    isSummaryView?: boolean;
};
export const TaskForm = ({ isSummaryView = false }: TaskFormProps) => {
    const formState = useContext(TaskDataContext);
    const { formData, setFormData, formSchema, uiSchema, formRef } = formState;

    const handleSubmitCallback = ({ formData, errors, schema }: any) => {
        console.log('Submitted data:', formData);
        console.log('Errors:', errors);
        console.log('Schema:', schema);
    };

    const handleChangeCallback = ({ formData }: any) => {
        setFormData(formData);
    };

    return (
        <DynamicForm
            formData={formData}
            formSchema={formSchema}
            uiSchema={uiSchema}
            handleChangeCallback={handleChangeCallback}
            handleSubmitCallback={handleSubmitCallback}
            ref={formRef}
            disabled={isSummaryView}
        ></DynamicForm>
    );
};
