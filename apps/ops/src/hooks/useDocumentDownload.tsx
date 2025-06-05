import { useMutation } from '@tanstack/react-query';
import { MetadataSearchResponse } from '@zinnia/api-types/types/documents-v3';
import { saveAs } from 'file-saver';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { OptimizelyVariableKey, useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyDocument, supportedExtensions } from '@deps/models/case/document';
import { getDocumentDownloadQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { isFeatureFlagVariableActive } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
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
    const { featureFlagVariables } = useOptimizely();
    const useV3 = isFeatureFlagVariableActive(
        featureFlagVariables,
        FEATURE_FLAG_VARIABLES.DOCUMENTS_V3_FEATURE_FLAG,
        OptimizelyVariableKey.Clients,
        carrierCode?.toLocaleLowerCase() || ''
    );
    const { mutate, isPending } = useMutation({
        mutationKey: ['document-download', documentId, documentType, carrierCode, fileType],
        mutationFn: () => getDocumentDownloadQuery(documentId, documentType, carrierCode, fileType, useV3),
        onSuccess: data => {
            if (data?.blob) {
                saveAs(data?.blob, `${documentName.replace(/[^A-Z0-9]/gi, '')}.${data?.fileExtension}`);
            }
        },
    });
    return [isPending, mutate];
};
