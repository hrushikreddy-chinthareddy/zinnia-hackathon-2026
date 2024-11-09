import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import React, { FormEvent, ForwardedRef } from 'react';

import fields from './customization/fields/fields';
import templates from './customization/templates/templates';
import widgets from './customization/widgets/widgets';
import { ApplyUITemplates } from './helpers/template.helper';

type DynamicFormProps = {
    onChange: (data: IChangeEvent<unknown, RJSFSchema, GenericObjectType>, id?: string) => void;
    onSubmit: (data: IChangeEvent<unknown, RJSFSchema, GenericObjectType>, event: FormEvent<any>) => void;
    formData: any;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    readonly?: boolean;
    formButtons?: any;
};

const DynamicForm = React.forwardRef(function DynamicFormComponent(
    { formData, formSchema, uiSchema, readonly = false, onChange, onSubmit, formButtons }: DynamicFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    ApplyUITemplates(uiSchema);

    return (
        <div>
            <Form
                ref={forwardedRef}
                schema={formSchema}
                formData={formData}
                onChange={onChange}
                onSubmit={onSubmit}
                validator={validator}
                uiSchema={uiSchema}
                widgets={widgets}
                fields={fields}
                templates={templates}
                readonly={readonly}
                showErrorList={false}
            >
                {formButtons}
            </Form>
        </div>
    );
});

export default DynamicForm;
