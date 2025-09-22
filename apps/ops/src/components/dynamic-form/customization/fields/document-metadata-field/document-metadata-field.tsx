import { FieldProps, getUiOptions } from '@rjsf/utils';

import { EDSDocumentRequestBody } from '@deps/models/case/document';

import DocumentMetadataFilter from '../../components/document-metadata/metadata-filter';

const DocumentMetadataField = (props: FieldProps) => {
    const { onChange, formData, formContext, readonly, uiSchema } = props;

    const { required } = getUiOptions(uiSchema);

    // Use the value from props directly instead of managing duplicate state
    const currentMetaData = formData || ({} as EDSDocumentRequestBody);
    const carrier = formContext?.customData?.carrier ?? '';

    const onChangeHandler = (data: EDSDocumentRequestBody) => {
        onChange(data);
    };

    return (
        <div className="w-full max-w-sm rounded-md">
            <DocumentMetadataFilter
                carrier={carrier}
                currentMetaData={currentMetaData}
                setCurrentMetaData={onChangeHandler}
                showRestricted={false}
                readonly={readonly}
                isRequired={required as boolean}
            />
        </div>
    );
};

export default DocumentMetadataField;
