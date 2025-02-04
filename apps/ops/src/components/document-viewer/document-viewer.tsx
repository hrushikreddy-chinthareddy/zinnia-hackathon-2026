// TODO: This files is obsolete at the moment. Keeping it for a short period until we determine if we want to restrict downloads again

import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import HtmlPreview from '@deps/containers/documents-page/html-preview';
import ImagePreview from '@deps/containers/documents-page/image-preview';
import PdfPreview from '@deps/containers/documents-page/pdf-preview';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { supportedExtensions, supportedImgExtensions } from '@deps/models/case/document';
import { getDocumentPreviewV2 } from '@deps/queries/api/client/documents/v2/preview';
import { getDocumentPreviewV3 } from '@deps/queries/api/client/documents/v3/preview';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { DocumentTypeView } from '../side-sheet/documents/DocumentTypeView';

export interface DocumentViewerProps {
    status: number;
    id: string;
    documentType?: DocumentTypeView;
    carrierCode?: string;
}

const DocumentViewer = (props: DocumentViewerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const [isLoading, setIsLoading] = useState(true);
    const [fileExtension, setFileExtension] = useState<null | string>(null);
    const [documentBinary, setDocumentBinary] = useState<null | string>(null);
    const { featureFlags } = useOptimizely();
    const { id, documentType, carrierCode } = props;

    useEffect(() => {
        const getDocument = async () => {
            let download;
            if (featureFlags[FEATURE_FLAGS.DOCUMENTS_V3]) {
                let docClass;
                switch (documentType) {
                    case DocumentTypeView.Correspondence:
                        docClass = SearchRequest.documentClassification.OUTBOUND;
                        break;
                    case DocumentTypeView.Policy:
                    default:
                        docClass = SearchRequest.documentClassification.INBOUND;
                        break;
                }
                download = await getDocumentPreviewV3(id, docClass, carrierCode || '');
            } else {
                download = await getDocumentPreviewV2(id, documentType || ('' as DocumentTypeView), carrierCode || '');
            }

            setFileExtension(download?.fileExtension?.toLowerCase() || null);
            setDocumentBinary(download?.binaryData || null);

            if (!download?.fileExtension) {
                console.error(`Error getting ${documentType} document ${id} for ${carrierCode}`);
            }

            if (!supportedExtensions.includes(download?.fileExtension?.toLowerCase() || '')) {
                console.error(`Unsupported file extension ${download?.fileExtension} for ${carrierCode} ${documentType} document ${id}`);
            }

            setIsLoading(false);
        };

        getDocument();

        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                console.error('Preventing save via CTRL+S');
                event.preventDefault();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [carrierCode, documentType, id, featureFlags]);

    if (isLoading) {
        return <PageLoader />;
    }

    if (!documentBinary) {
        return (
            <div className="ml-8 mt-8">
                <Typography variant={TypographyVariant.H3}>{t('sideSheet.documentNotFound')}</Typography>{' '}
            </div>
        );
    }

    if ((fileExtension === 'htm' || fileExtension === 'html') && documentBinary) {
        return <HtmlPreview documentBinary={documentBinary} />;
    }

    if (fileExtension && documentBinary && supportedImgExtensions.includes(fileExtension)) {
        return <ImagePreview documentBinary={documentBinary} fileExtension={fileExtension} />;
    }

    if (fileExtension === 'pdf' && documentBinary) {
        return <PdfPreview documentBinary={documentBinary} />;
    }

    return (
        <div className="ml-8 mt-8">
            <Typography variant={TypographyVariant.H3}>{t('sideSheet.documentUnsupported', { extension: fileExtension })}</Typography>{' '}
        </div>
    );
};

export default DocumentViewer;
