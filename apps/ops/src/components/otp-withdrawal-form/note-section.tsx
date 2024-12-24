import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { ForwardedRef } from 'react';

import DynamicForm from '../dynamic-form/dynamic-form';
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
type NoteSectionProps = {
    readonly?: boolean;
};

const NoteSection = React.forwardRef(function NoteSectionComponent(
    { readonly = false }: NoteSectionProps,
    forwardedRef: ForwardedRef<Form>
) {
    const handleChange = (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
        console.log('🚀 ~ event:', event);
    };

    const formData = {};

    const formSchema: RJSFSchema = {
        title: 'Comment',
        type: 'object',
        required: ['options'],
        properties: {
            options: {
                type: 'string',
                title: 'Comment',
                default: 'REPLACEMENT PAPERWORK',
                oneOf: [
                    {
                        const: 'LOA',
                        title: 'LOA',
                    },
                    {
                        const: 'REPLACEMENT PAPERWORK',
                        title: 'REPLACEMENT PAPERWORK',
                    },
                    {
                        const: 'VOIDED CHECK/BANK LETTERHEAD',
                        title: 'VOIDED CHECK/BANK LETTERHEAD',
                    },
                    {
                        const: 'TRUST/NNO PAPERWORK',
                        title: 'TRUST/NNO PAPERWORK',
                    },
                    {
                        const: 'POA PAPERWORK',
                        title: 'POA PAPERWORK',
                    },
                    {
                        const: 'OTHER',
                        title: 'OTHER',
                    },
                ],
            },
            comment: { type: 'string', title: 'Description', default: '' },
        },
    };

    return (
        <DynamicForm
            ref={forwardedRef}
            formData={formData}
            taskMetadata={{
                formSchema,
                uiSchema: {
                    'ui:submitButtonOptions': {
                        norender: true,
                    },
                    options: {
                        'ui:label': false,
                    },
                    comment: {
                        'ui:label': false,
                    },
                },
            }}
            onChange={handleChange}
            onSubmit={noop}
            readonly={readonly}
        ></DynamicForm>
    );
});

export default NoteSection;
