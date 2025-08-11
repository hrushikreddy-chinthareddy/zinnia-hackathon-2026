import { useTranslation } from 'next-i18next';

import { DocumentActions } from '@deps/components/dynamic-form/customization/templates/card-templates/card-template';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { ReactComponent as DOCUMENT_TEXT_ICON } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';

interface IDocumentCard {
    document: {
        documentId: string;
        documentName: string;
        displayName: string;
        documentExt: string;
        carrier: string;
    };
}
const DocumentCard: React.FC<IDocumentCard> = (props) => {
    const { t } = useTranslation();
    const { document } = props;
    return (
        <div
            className={`flex w-[455px] rounded border border-gray-100 p-[12px] mb-2 ${''}`}
        >
            <div className="px-2">
                <DOCUMENT_TEXT_ICON width={25} height={25} />
            </div>
            <div className="grow">
                <div className="text-sm font-bold break-all">
                    <PiiWrapper>{document.displayName}</PiiWrapper>
                </div>
                <div className="flex items-center text-sm font-normal text-gray-300">
                    <PiiWrapper>Document ID: {document.documentId}</PiiWrapper>
                </div>
            </div>
            <DocumentActions document={document} t={t} />
        </div>
    );
};

export default DocumentCard;
