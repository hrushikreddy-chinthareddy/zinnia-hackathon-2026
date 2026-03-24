import { RJSFSchema, WidgetProps } from '@rjsf/utils';

import { useAttachments } from '@deps/hooks/useAttachments';
import { EDSDocumentRequestBody } from '@deps/models/case/document';
import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';

import FileUploadComponent from './file-upload-component';
import FileListing from '../../components/file-listing/file-listing';

export interface UploadContextData {
    carrier?: string;
    caseId?: string;
    correlationId?: string;
    defaultMeta?: Partial<EDSDocumentRequestBody>;
}

export interface StandaloneFileWidgetProps {
    isStandalone?: true;
    standaloneBehavior?: 'preview' | 'direct';
    onSubmitStandalone?: (files: FileList) => void;
    onUploadComplete?: (docs: TaskDocument[]) => void;
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;
    readonly?: boolean;
    contextData?: UploadContextData;
}

export interface FileAttachmentProps {
    setAttachments: (file: TaskDocument, operationType?: ActionTypes) => void;
    widgetProps?: Partial<WidgetProps<any, RJSFSchema, any>>;
    attachments?: TaskDocument[];
}

type FileWidgetProps =
    | (WidgetProps & { isStandalone?: false })
    | StandaloneFileWidgetProps;

export default function FileWidget(props: FileWidgetProps) {
    if (props.isStandalone) {
        return <StandaloneFileWidget {...props} />;
    }

    return <RJSFFileWidget {...(props as WidgetProps)} />;
}

function StandaloneFileWidget(props: StandaloneFileWidgetProps) {
    const {
        standaloneBehavior,
        onSubmitStandalone,
        onUploadComplete,
        multiple,
        accept,
        disabled,
        readonly,
        contextData,
    } = props;

    return (
        <FileUploadComponent
            contextData={contextData}
            isStandalone
            standaloneBehavior={standaloneBehavior}
            setAttachments={() => {}}
            onSubmitStandalone={onSubmitStandalone}
            onUploadComplete={onUploadComplete}
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            readonly={readonly}
        />
    );
}

function RJSFFileWidget(widgetProps: WidgetProps) {
    const { multiple, onChange, value, formContext } = widgetProps;

    const { attachments, handleSetAttachments } = useAttachments({
        initialFiles: value,
        multiple: multiple ?? true,
        onChange,
        formContext,
    });

    return (
        <>
            <FileUploadComponent
                widgetProps={widgetProps}
                setAttachments={handleSetAttachments}
                attachments={attachments}
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
}
