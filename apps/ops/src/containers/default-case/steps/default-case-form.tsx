import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { ForwardedRef, useCallback, useMemo, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { useDefaultCase } from '@deps/contexts/DefaultCaseContext';
import { FormMetadata } from '@deps/models/case/task';
import { submitServiceRequestForm } from '@deps/queries/api/process';
import { cleanForm } from '@deps/utils/tasks/task-payload-helpers';

type DefaultCaseFormProps = {
    readonly: boolean;
    onSubmit: (error: string) => void;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
};
export const DefaultCaseForm = React.forwardRef(function DefaultCaseFormComponent(
    { readonly, onSubmit, isSubmit, taskMetadata }: DefaultCaseFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const { defaultCaseData, setDefaultCaseData, policy, setSubmitFailed, correlationId } = useDefaultCase();
    const [formSchema, setFormSchema] = useState(taskMetadata);

    const handleSubmit = useCallback(async () => {
        if (!isSubmit) {
            onSubmit('');
            return;
        }
        const defaultCasePayload = cleanForm(defaultCaseData, taskMetadata);
        const success = await submitServiceRequestForm(defaultCasePayload);
        setSubmitFailed(!success);
        onSubmit('');
    }, [isSubmit, onSubmit, defaultCaseData, taskMetadata, setSubmitFailed]);

    const handleChange = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            setDefaultCaseData((ogDefaultCaseData: any) => ({
                ...ogDefaultCaseData,
                ...event.formData,
            }));
        },
        [setDefaultCaseData]
    );

    const setFormContext = (dynamicData: any) => {
        setDefaultCaseData((ogDefaultCaseData: any) => ({
            ...ogDefaultCaseData,
            ...dynamicData,
        }));
    };

    const updateSchemaHandler = (dynamicData: any) => {
        Object.keys(dynamicData).forEach(key => {
            const currentSchema1 = {
                ...formSchema,
                formSchema: {
                    ...formSchema.formSchema,
                    definitions: {
                        ...formSchema.formSchema.definitions,
                        [key]: { ...dynamicData[key] },
                    },
                },
            };
            setFormSchema(oldSchema => ({ ...oldSchema, ...currentSchema1 }));
        });
    };

    const memoizedSchema = useMemo(() => formSchema, [formSchema]);

    return (
        <DynamicForm
            ref={forwardedRef}
            formData={defaultCaseData}
            taskMetadata={memoizedSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            formContext={{
                customData: { ...defaultCaseData, carrier: policy.carrierId, correlationId },
                setCustomData: setFormContext,
                updateSchema: updateSchemaHandler,
            }}
            readonly={readonly}
        ></DynamicForm>
    );
});
