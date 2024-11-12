import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { useDocumentDownload } from '@deps/helpers/documents.helper';
import { ReactComponent as DownloadIcon } from '@deps/styles/elements/icons/icons_outlined/download.svg';
import loadingImage from '@deps/styles/images/loader.png';

import { DocumentTypeView } from '../side-sheet/documents/documents-content';

type DownloadProps = {
    documentId: string;
    documentType: DocumentTypeView;
    carrierCode: string;
};

type DocumentDownloaderProps = DownloadProps & {
    documentName: string;
};

export default function DocumentDownloader({ documentId, documentType, carrierCode, documentName }: DocumentDownloaderProps) {
    const { t } = useTranslation();
    const [loading, download] = useDocumentDownload(documentId, documentType, carrierCode, documentName);

    return (
        <NavElement
            className="flex max-w-[234px] gap-1 text-left"
            onClick={download}
            size={NavElementSize.Small}
            title={`${t('general.download')} ${documentName}`}
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
