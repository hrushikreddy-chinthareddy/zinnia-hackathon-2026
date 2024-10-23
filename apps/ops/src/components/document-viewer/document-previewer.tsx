import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../nav-element/nav-element';
import { DocumentTypeView } from '../side-sheet/documents/documents-content';

export interface DocumentPreviewerProps {
    activeDocType: DocumentTypeView;
    carrier: string;
    displayName: string;
    documentId: string;
    className?: string;
    variant?: NavElementVariant;
}

export default function DocumentPreviewer({
    activeDocType,
    carrier,
    displayName,
    documentId,
    children,
    className = '',
    variant,
}: DocumentPreviewerProps & { children: React.ReactNode }) {
    const { t } = useTranslation();
    const setCookies = () => {
        setCookie('documentType', activeDocType);
        setCookie('carrierCode', carrier);
    };
    return (
        <NavElement
            className={className}
            href={`/documents/${documentId}`}
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
