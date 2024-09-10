import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../nav-element/nav-element';
import { SideSheetDocumentItemProps } from '../side-sheet/documents/document-item/document-item';

export default function DocumentPreviewer({
    activeDocType,
    carrier,
    document,
    children,
    className = '',
    variant,
}: SideSheetDocumentItemProps & { children: React.ReactNode; className?: string; variant?: NavElementVariant }) {
    const { t } = useTranslation();
    const { displayName, documentId, documentID } = document;
    const setCookies = () => {
        setCookie('documentType', activeDocType);
        setCookie('carrierCode', carrier);
    };

    return (
        <NavElement
            className={className}
            href={`/documents/${documentId ?? documentID}`}
            isNewPage={false}
            onClick={setCookies}
            size={NavElementSize.Small}
            target="_blank"
            title={`${t('general.preview')} ${displayName}`}
            type={NavElementType.Link}
            variant={variant}
        >
            {children}
        </NavElement>
    );
}
