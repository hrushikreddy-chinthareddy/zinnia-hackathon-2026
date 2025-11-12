import { useTranslation } from 'next-i18next';

import { DocumentActions } from '@deps/components/dynamic-form/customization/templates/card-templates/card-template';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { ReactComponent as DOCUMENT_TEXT_ICON } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';

interface IDocumentCard {
    cardClass?: string;
    document: {
        documentId: string;
        documentName?: string;
        displayName?: string;
        documentExt?: string;
        docTypeView?: DocumentTypeView;
        carrier: string;
    };
    isViewButtonHidden?: boolean;
}

const DocumentCard: React.FC<IDocumentCard> = (props) => {
    const { t } = useTranslation();
    const { document, cardClass, isViewButtonHidden } = props;
    return (
        <div
            className={`flex rounded border border-gray-100 p-[12px] ${
                cardClass ?? ''
            }`}
        >
            <div className="px-2">
                <DOCUMENT_TEXT_ICON width={25} height={25} />
            </div>
            <div className="grow">
                {document?.displayName && (
                    <div className="text-sm font-bold break-all">
                        <PiiWrapper>{document.displayName}</PiiWrapper>
                    </div>
                )}
                <div className="flex items-center text-sm font-normal text-gray-600">
                    <PiiWrapper>
                        {t('caseOverview.sidesheet.documentId', {
                            documentId: document.documentId,
                        })}
                    </PiiWrapper>
                </div>
            </div>
            <DocumentActions
                t={t}
                document={document}
                isViewButtonHidden={isViewButtonHidden}
            />
        </div>
    );
};

export default DocumentCard;
