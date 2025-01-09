import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { useDocumentDownload } from '@deps/hooks/useDocumentDownload';
import { ReactComponent as DownloadIcon } from '@deps/styles/elements/icons/icons_outlined/download.svg';
import loadingImage from '@deps/styles/images/loader.png';

import { DocumentTypeView } from '../side-sheet/documents/documents-content';

type DocumentDownloaderProps = {
    document: DocumentWithSource; // BPB - fix this!
    downloadedFileName?: string; // What you want the fileName to be.  Defaults to a version of the displayName of the document.
    carrierCode: string;
};

export default function DocumentDownloader({ carrierCode, document, downloadedFileName }: DocumentDownloaderProps) {
    const { t } = useTranslation();
    const { documentId, documentID, documentType, displayName } = document;
    const documentName = downloadedFileName ?? displayName;

    const [loading, download] = useDocumentDownload(
        documentId ?? (documentID as string),
        documentType as DocumentTypeView,
        carrierCode,
        documentName
    );

    return (
        <NavElement
            className="flex max-w-[234px] gap-1 text-left"
            onClick={download}
            size={NavElementSize.Small}
            title={`${t('general.download')} ${displayName || downloadedFileName}`}
            type={NavElementType.Button}
        >
            {!loading && <DownloadIcon className="shrink-0" role="presentation" width={20} height={20} />}
            {loading && (
                <Image
                    alt={t('general.downloading')}
                    className="transform-origin-center duration-2000 animate-spin ease-linear"
                    height={20}
                    src={loadingImage}
                    width={20}
                />
            )}
            {documentName}
        </NavElement>
    );
}
