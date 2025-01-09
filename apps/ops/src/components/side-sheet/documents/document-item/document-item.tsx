import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'next-i18next';

import DocumentDownloader from '@deps/components/document-viewer/document-downloader';
import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import { isPreviewSupported } from '@deps/hooks/useDocumentDownload';
import { PolicyDocument } from '@deps/models/case/document';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-search.svg';

import { DocumentTypeView } from '../documents-content';

dayjs.extend(relativeTime);

export interface SideSheetDocumentItemProps {
    document: PolicyDocument;
    carrier?: string;
    activeDocType: DocumentTypeView;
}

export default function SideSheetDocumentItem({ document, carrier = '', activeDocType }: SideSheetDocumentItemProps) {
    const { t } = useTranslation();
    const { displayName, documentDate } = document;
    const timeAgo = dayjs(documentDate).fromNow(); //just as a heads up this cannot be translated bc it is an external library eag
    const canPreview = isPreviewSupported(document);

    return (
        <div className="flex max-h-[91px] items-center justify-between overflow-hidden border-b-2 border-gray-100 py-8.5 pl-10 pr-5 last:border-b-0">
            {canPreview ? (
                <DocumentPreviewer
                    className="flex max-w-[234px] gap-1"
                    activeDocType={activeDocType}
                    carrier={carrier}
                    displayName={document.displayName}
                    documentId={document.documentId ?? (document.documentID as string)}
                >
                    <>
                        <DocumentIcon className="shrink-0" role="presentation" width={20} height={20} />
                        {displayName}
                    </>
                </DocumentPreviewer>
            ) : (
                <DocumentDownloader document={{ ...document, documentSource: activeDocType }} carrierCode={carrier} />
            )}
            <p className="font-primary text-sm font-medium leading-4 text-gray-600">{`${t('sideSheet.posted')} ${timeAgo}`}</p>
        </div>
    );
}
