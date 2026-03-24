import { RJSFSchema, WidgetProps } from '@rjsf/utils';

import { ActionTypes } from '@deps/models/case/task';

import { BaseFileSearchField } from './base-file-search-field';
import { FileAttachmentProps } from '../../widgets/file-widget/file-widget';

export const RJSFFileSearchField = ({
    attachments,
    setAttachments,
    widgetProps,
}: FileAttachmentProps) => {
    const { formContext, readonly, disabled, rawErrors } =
        widgetProps ?? ({} as Partial<WidgetProps<any, RJSFSchema, any>>);

    const handleSelect = (document: any) => {
        setAttachments(
            {
                documentId: document.documentId,
                docCategory: document.documentCategory,
                documentType: document.documentType,
                documentExt: document.fileType,
                documentName: document.displayName,
            },
            ActionTypes.Add
        );
    };

    return (
        <BaseFileSearchField
            carrier={formContext?.customData?.carrier}
            caseId={formContext?.customData?.caseId}
            disabled={disabled}
            readonly={readonly}
            rawErrors={rawErrors}
            onSelect={handleSelect}
            linkedDocuments={attachments}
        />
    );
};
