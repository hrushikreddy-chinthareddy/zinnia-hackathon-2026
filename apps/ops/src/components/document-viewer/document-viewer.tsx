import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import HtmlPreview from '@deps/containers/documents-page/html-preview';
import ImagePreview from '@deps/containers/documents-page/image-preview';
import PdfPreview from '@deps/containers/documents-page/pdf-preview';
import { supportedExtensions, supportedImgExtensions } from '@deps/models/case/document';
import { getDocumentPreview } from '@deps/queries/api/documents';

export interface DocumentViewerProps {
    status: number;
    id: string;
    documentType?: string;
    carrierCode?: string;
}

const DocumentViewer = (props: DocumentViewerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const [isLoading, setIsLoading] = useState(true);
    const [fileExtension, setFileExtension] = useState<null | string>(null);
    const [documentBinary, setDocumentBinary] = useState<null | string>(null);
    const { id, documentType, carrierCode } = props;

    useEffect(() => {
        const getDocument = async () => {
            const download = await getDocumentPreview(id, documentType || '', carrierCode || '');

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
    }, [carrierCode, documentType, id]);

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
