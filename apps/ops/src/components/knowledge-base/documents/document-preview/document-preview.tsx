import { ClientDocumentDto } from '@xd/api-types/dist/generated-types/knowledgebase';
import { Loader } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getDocumentPreview } from '@deps/queries/api/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';

type DocumentPreviewProps = {
    document: ClientDocumentDto | null;
};

const DocumentPreview = ({
    document: currentDocument,
}: DocumentPreviewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const [document, setDocument] = useState('');
    const [loading, setLoading] = useState(false);
    const fileExtension =
        currentDocument?.name?.split('.').pop()?.toLowerCase() || '';

    useEffect(() => {
        const fetchDocument = async () => {
            setLoading(true);
            try {
                if (currentDocument) {
                    const response = await getDocumentPreview(
                        currentDocument?.driveId || '',
                        currentDocument?.itemId || '',
                        fileExtension
                    );
                    if (response) {
                        const blob = new Blob([response.data], {
                            type: 'application/pdf',
                        });
                        const url = URL.createObjectURL(blob);
                        setDocument(url);
                    }
                }
            } catch (error) {
                browserLogError('Error fetching document:', { error });
            } finally {
                setLoading(false);
            }
        };
        if (currentDocument && fileExtension) {
            fetchDocument();
        }
    }, [currentDocument, fileExtension]);

    return (
        <div
            className="flex flex-1 gap-4 px-4 py-2 w-full h-full"
            data-testid="doc-preview"
        >
            <div className="flex-1 bg-gray-50 p-4 rounded-md h-full ">
                <Typography variant={TypographyVariant.BodySm} className="mb-2">
                    {t('documents.docPreview')}
                </Typography>
                {loading ? (
                    <div
                        className="w-full h-full flex items-center justify-center p-8"
                        data-testid="doc-preview-loader"
                    >
                        <Loader />
                    </div>
                ) : document ? (
                    <iframe
                        src={document}
                        width="100%"
                        height="100%"
                        data-testid="doc-preview-iframe"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-8">
                        <Typography
                            variant={TypographyVariant.H4}
                            className="mb-2"
                        >
                            {t('documents.noPreview')}
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentPreview;
