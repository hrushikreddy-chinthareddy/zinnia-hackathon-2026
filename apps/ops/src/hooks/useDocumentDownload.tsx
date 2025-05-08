import { useMutation } from '@tanstack/react-query';
import { MetadataSearchResponse } from '@zinnia/api-types/types/documents-v3';
import { saveAs } from 'file-saver';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { DocumentDownloadV2WithMime, PolicyDocument, supportedExtensions } from '@deps/models/case/document';
import { downloadDocumentV2 } from '@deps/queries/api/client/documents/v2/download';
import { downloadDocumentV3 } from '@deps/queries/api/client/documents/v3/download';
import { getDocumentDownloadQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { DocumentDownloadV3WithMime } from '@deps/types/documents-v3';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
export const isPreviewSupported = (document: PolicyDocument | MetadataSearchResponse): boolean => {
    return supportedExtensions.includes(document?.fileType?.trim().toLowerCase() || '');
};

export const useDocumentDownload = (
    documentId: string,
    documentType: DocumentTypeView,
    carrierCode: string,
    documentName: string,
    fileType: string | undefined
): [boolean, () => void] => {
    const { featureFlags } = useOptimizely();
    const { mutate, isPending } = useMutation({
        mutationKey: ['document-download', documentId, documentType, carrierCode, fileType],
        mutationFn: () =>
            getDocumentDownloadQuery(documentId, documentType, carrierCode, fileType, featureFlags[FEATURE_FLAGS.DOCUMENTS_V3]),
        onSuccess: data => {
            if (data?.blob) {
                saveAs(data?.blob, `${documentName.replace(/[^A-Z0-9]/gi, '')}.${data?.fileExtension}`);
            }
        },
    });
    return [isPending, mutate];
};
