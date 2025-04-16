import { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { useCallback, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { FormMetadata } from '@deps/models/case/task';
import { cleanForm } from '@deps/utils/tasks/task-payload-helper';

export type FileAttachmentComponentProps = {
    schema: FormMetadata;
    formData: any;
    onClose: () => void;
    onSubmit: (data: any) => void;
};

const FileAttachmentComponent = ({ schema, formData, onSubmit, onClose }: FileAttachmentComponentProps) => {
    const [currentFormData, setCurrentFormData] = useState(formData);
    const [currentSchema, setCurrentSchema] = useState(schema);
    const uploadChangeHandler = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            setCurrentFormData((ogData: any) => ({
                ...ogData,
                ...event.formData,
            }));
        },

        [setCurrentFormData]
    );

    const onSubmitHandler = useCallback(() => {
        setCurrentSchema((prevSchema: any) => ({
            ...prevSchema,
            uiSchema: {
                ...prevSchema.uiSchema,
                'ui:submitButtonOptions': {
                    ...prevSchema.uiSchema?.['ui:submitButtonOptions'],
                    props: {
                        ...prevSchema.uiSchema?.['ui:submitButtonOptions']?.props,
                        disabled: true,
                    },
                },
            },
        }));
        const payload = cleanForm(currentFormData, currentSchema);

        onSubmit(payload);
    }, [currentFormData, currentSchema, onSubmit]);

    const updateSchemaHandler = (dynamicData: any) => {
        Object.keys(dynamicData).forEach(key => {
            const updatedSchema = {
                ...currentSchema,
                formSchema: {
                    ...currentSchema.formSchema,
                    definitions: {
                        ...currentSchema.formSchema.definitions,
                        [key]: { ...dynamicData[key] },
                    },
                },
            };
            setCurrentSchema(oldSchema => ({ ...oldSchema, ...updatedSchema }));
        });
    };

    const setCustomDataHandler = (data: any) => {
        setCurrentFormData((ogTask: any) => ({
            ...ogTask,
            ...data,
        }));
    };

    return (
        <DynamicForm
            taskMetadata={currentSchema}
            onSubmit={onSubmitHandler}
            formData={currentFormData}
            onChange={uploadChangeHandler}
            formContext={{
                customData: { ...formData },
                setCustomData: setCustomDataHandler,
                onCancel: onClose,
                updateSchema: updateSchemaHandler,
            }}
        />
    );
};

export default FileAttachmentComponent;
