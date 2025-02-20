import { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { useCallback, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { FormMetadata } from '@deps/models/case/task';

export type FileAttachmentComponentProps = {
    schema: FormMetadata;
    formData: any;
    files: any;
    onClose: () => void;
};
const FileAttachmentComponent = ({ schema, formData, files, onClose }: FileAttachmentComponentProps) => {
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

    const onSubmit = useCallback(
        (values: any) => {
            console.log('values', currentFormData, values, files);
            onClose();
        },
        [currentFormData, files]
    );

    const setFormContext = (dynamicData: any) => {
        Object.keys(dynamicData).forEach(key => {
            const currentSchema1 = {
                ...currentSchema,
                formSchema: {
                    ...currentSchema.formSchema,
                    definitions: {
                        ...currentSchema.formSchema.definitions,
                        [key]: { ...dynamicData[key] },
                    },
                },
            };
            setCurrentSchema(oldSchema => ({ ...oldSchema, ...currentSchema1 }));
        });

        setCurrentFormData((ogTask: any) => ({
            ...ogTask,
            ...dynamicData,
        }));
    };

    return (
        <DynamicForm
            taskMetadata={currentSchema}
            onSubmit={onSubmit}
            formData={currentFormData}
            onChange={uploadChangeHandler}
            formContext={{ customData: { ...formData }, setCustomData: setFormContext }}
        />
    );
};

export default FileAttachmentComponent;
