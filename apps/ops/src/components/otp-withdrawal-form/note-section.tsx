import { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { useContext } from 'react';

import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import FormSchema from '@deps/jsonschema-mock-service/process-automation/note-section/form-schema.json';
import UiSchema from '@deps/jsonschema-mock-service/process-automation/note-section/ui-schema.json';

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

    return (
        <CardContainer classNames={'w-full'} containerClassNames="w-full content-divider">
            <DynamicForm
                formData={formData}
                taskMetadata={{
                    formSchema: FormSchema as RJSFSchema,
                    uiSchema: UiSchema,
                }}
                onChange={handleChange}
                onSubmit={noop}
                readonly={isFormStateReadOnly}
                setFormData={noop}
            ></DynamicForm>
        </CardContainer>
    );
});

export default NoteSection;
