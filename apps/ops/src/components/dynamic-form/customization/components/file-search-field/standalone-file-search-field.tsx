import { TaskDocument } from '@deps/models/case/task-instance';
import { MetadataSearchResponse } from '@zinnia/api-types/types/documents-v3';

import { BaseFileSearchField } from './base-file-search-field';

export type LinkedDocType = TaskDocument | MetadataSearchResponse;

interface StandaloneFileSearchFieldProps {
    carrier?: string;
    caseId?: string;
    disabled?: boolean;
    readonly?: boolean;
    linkedDocuments?: LinkedDocType[];
    onSelectDocument: (doc: MetadataSearchResponse) => void;
}

export const StandaloneFileSearchField = ({
    carrier,
    caseId,
    disabled,
    readonly,
    linkedDocuments = [],
    onSelectDocument,
}: StandaloneFileSearchFieldProps) => {
    return (
        <BaseFileSearchField
            carrier={carrier}
            caseId={caseId}
            disabled={disabled || false}
            readonly={readonly || false}
            linkedDocuments={linkedDocuments}
            onSelect={onSelectDocument}
        />
    );
};
