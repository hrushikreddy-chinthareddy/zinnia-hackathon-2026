import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import React, { FormEvent, ForwardedRef } from 'react';

import fields from './customization/fields/fields';
import templates from './customization/templates/templates';
import widgets from './customization/widgets/widgets';

type DynamicFormProps = {
    handleChangeCallback: (data: IChangeEvent<unknown, RJSFSchema, GenericObjectType>, id?: string | undefined) => void;
    handleSubmitCallback: (data: IChangeEvent<unknown, RJSFSchema, GenericObjectType>, event: FormEvent<any>) => void;
    formData: any;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    disabled?: boolean;
    formButtons?: any;
};

const DynamicForm = React.forwardRef(function DynamicFormComponent(
    { formData, formSchema, uiSchema, disabled, handleChangeCallback, handleSubmitCallback, formButtons }: DynamicFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    return (
        <div>
            <Form
                ref={forwardedRef}
                schema={formSchema}
                formData={formData}
                onChange={handleChangeCallback}
                onSubmit={handleSubmitCallback}
                validator={validator}
                uiSchema={uiSchema}
                widgets={widgets}
                fields={fields}
                templates={templates}
                disabled={disabled}
            >
                {formButtons}
            </Form>
        </div>
    );
});

export default DynamicForm;
