import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import React, { FormEvent, ForwardedRef } from 'react';

import { FormMetadata } from '@deps/models/case/task';

import fields from './customization/fields/fields';
import templates from './customization/templates/templates';
import widgets from './customization/widgets/widgets';
import { ApplyUITemplates } from './helpers/template.helpers';

type DynamicFormProps = {
    onChange: (data: IChangeEvent<unknown, RJSFSchema, GenericObjectType>, id?: string) => void;
    onSubmit: (data: IChangeEvent<unknown, RJSFSchema, GenericObjectType>, event: FormEvent<any>) => void;
    formData: any;
    taskMetadata: FormMetadata;
    readonly?: boolean;
    formButtons?: any;
    formContext?: { customData: any; setCustomData: (data: any) => void; onCancel?: () => void; updateSchema?: (data: any) => void };
};

const DynamicForm = React.forwardRef(function DynamicFormComponent(
    { formData, taskMetadata, readonly = false, onChange, onSubmit, formButtons, formContext }: DynamicFormProps,

    forwardedRef: ForwardedRef<Form>
) {
    ApplyUITemplates(taskMetadata.uiSchema);

    return (
        <div>
            <Form
                ref={forwardedRef}
                schema={taskMetadata.formSchema}
                uiSchema={taskMetadata.uiSchema}
                formData={formData}
                onChange={onChange}
                onSubmit={onSubmit}
                validator={validator}
                widgets={widgets}
                fields={fields}
                templates={templates}
                readonly={readonly}
                showErrorList={false}
                formContext={formContext}
            >
                {formButtons}
            </Form>
        </div>
    );
});

export default DynamicForm;
