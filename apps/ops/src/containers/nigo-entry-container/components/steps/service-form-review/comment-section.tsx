import { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { useContext } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import CommentSchema from '@deps/jsonschema-mock-service/process-automation/comment-section/form-section.json';
import CommentUISchema from '@deps/jsonschema-mock-service/process-automation/comment-section/ui-schema.json';

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;


const CommentSection = React.forwardRef(function CommentSectionComponent() {
    const { formComment, setFormComment } = useContext(FormDataContext);
    const formData = {
        comment: formComment?.comment ?? '',
    };
    const handleChange = (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
        const { comment } = event.formData ?? {};
        setFormComment(formComment => ({
            ...formComment,
            comment: comment ?? '',
        }));
    };

    return (
        <div className='mx-8'>
            <DynamicForm
                formData={formData}
                taskMetadata={{
                    formSchema: CommentSchema as RJSFSchema,
                    uiSchema:  CommentUISchema,
                }}
                onChange={handleChange}
                onSubmit={noop}
            ></DynamicForm>
        </div>
    );
});

export default CommentSection;
