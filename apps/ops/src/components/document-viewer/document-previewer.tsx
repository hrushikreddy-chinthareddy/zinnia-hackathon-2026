import { useTranslation } from 'next-i18next';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import {
    CaseDocumentClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '../nav-element/nav-element';
import { DocumentTypeView } from '../side-sheet/documents/DocumentTypeView';

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
    const { sessionId, partyId } = usePermissionsContext();

    const trackDocumentPreview = () => {
        segmentAnalyticsTrackEvent<CaseDocumentClickedEvent>(
            SegmentTrackedEventName.CaseDocumentClicked,
            {
                session_id: sessionId,
                userId: partyId,
                type: 'Preview',
                documentId,
            }
        );
    };

    return (
        <NavElement
            className={className}
            href={`/documents/${documentId}?documentType=${activeDocType}&carrierCode=${carrier}`}
            isNewPage={false}
            onClick={trackDocumentPreview}
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
