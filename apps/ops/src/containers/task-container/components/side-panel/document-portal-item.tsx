import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyDocument } from '@deps/models/case/document';

type DocumentItemProps = {
    document: PolicyDocument;
    carrierId: string;
    documentNumber: string;
    activeDocType: DocumentTypeView;
};

const DocumentItem = ({ document, carrierId, documentNumber, activeDocType }: DocumentItemProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.documentPanel' });

    return (
        <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
            <div>
                <Icon width={25} height={25} type={IconType.DOCUMENT_TEXT} />{' '}
            </div>
            <div>
                <div className="text-sm font-bold ">{document?.displayName}</div>
                <div className="flex items-center text-sm font-normal text-gray-300">{t('documentId') + ' ' + documentNumber}</div>
            </div>
            <div className="flex items-center">
                <DocumentPreviewer
                    className="flex gap-1"
                    activeDocType={activeDocType}
                    carrier={carrierId}
                    documentId={document?.documentId || document?.documentID || ''}
                    displayName={document?.displayName || ''}
                >
                    <>{t('view')}</>
                </DocumentPreviewer>
            </div>
        </div>
    );
};

export default DocumentItem;
