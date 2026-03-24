import { FieldProps } from '@rjsf/utils';

import { useAttachments } from '@deps/hooks/useAttachments';

import FileListing from '../../components/file-listing/file-listing';
import { RJSFFileSearchField } from '../../components/file-search-field/rjsf-file-search-field';

const AutoCompleteField = (props: FieldProps) => {
    const { onChange, formData, uiSchema, formContext, schema } = props;
    const multiple = schema?.type === 'array';
    const widgetProps = {
        onChange,
        value: formData,
        uiSchema,
        formContext,
        id: props.id || '',
        name: props.name,
        schema: props.schema,
        options: props.options,
        onBlur: props.onBlur,
        onFocus: props.onFocus,
        label: props.label,
        registry: props.registry,
        readonly: props.readonly,
    };

    const { attachments, handleSetAttachments } = useAttachments({
        initialFiles: formData,
        multiple,
        onChange,
        formContext,
    });

    return (
        <>
            <RJSFFileSearchField
                attachments={attachments}
                setAttachments={handleSetAttachments}
                widgetProps={widgetProps}
            />

            {attachments?.length ? (
                <FileListing
                    attachments={attachments}
                    setAttachments={handleSetAttachments}
                    widgetProps={widgetProps}
                />
            ) : null}
        </>
    );
};

export default AutoCompleteField;
