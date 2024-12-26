import { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { useContext } from 'react';

import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

import DynamicForm from '../dynamic-form/dynamic-form';
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

const NoteSection = React.forwardRef(function NoteSectionComponent() {
    const { formComment, setFormComment, isFormStateReadOnly } = useContext(FormDataContext);
    const commentParts = formComment?.comment?.split(' - ');

    const formData = {
        options: commentParts?.[0] ?? '',
        comment: commentParts?.[1] ?? '',
    };
    const handleChange = (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
        const { options, comment } = event.formData ?? {};
        setFormComment(formComment => ({
            ...formComment,
            comment: options ? `${options} - ${comment}` : comment,
        }));
    };

    const formSchema: RJSFSchema = {
        title: 'Comment',
        type: 'object',
        required: [],
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
        <CardContainer classNames={'w-full'} containerClassNames="w-full content-divider">
            <DynamicForm
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
                readonly={isFormStateReadOnly}
            ></DynamicForm>
        </CardContainer>
    );
});

export default NoteSection;
