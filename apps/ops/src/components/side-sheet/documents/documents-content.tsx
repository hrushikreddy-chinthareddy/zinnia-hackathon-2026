// BPB - can delete if we remove the old case details page
import { useTranslation } from 'next-i18next';
import { useState, useCallback, useEffect } from 'react';

import ButtonGroup from '@deps/components/button-group/button-group';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import PaginationControls from '@deps/components/pagination/pagination';
import SideSheetDocumentItem from '@deps/components/side-sheet/documents/document-item/document-item';
import SideSheetEmpty from '@deps/components/side-sheet/side-sheet-empty/side-sheet-empty';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { Case } from '@deps/models/case/case';
import { ReactComponent as PaperClipIcon } from '@deps/styles/elements/icons/communications/paper-clip.svg';

import { DocumentTypeView } from './DocumentTypeView';

interface DocumentsContentCaseProps {
    caseDetails?: Case;
}

export const DocumentsContent: React.FC<DocumentsContentCaseProps> = ({ caseDetails }) => {
    const { t } = useTranslation();

    /** Local state management */
    const [activeDocType, setActiveDocType] = useState(DocumentTypeView.Policy);
    const [offset, setOffset] = useState(0);
    const { policyDocs, correspondenceDocs, loadingDocuments } = useCaseActivityContext();
    const docTotal = policyDocs?.length;
    const correspondenceTotal = correspondenceDocs?.length;
    const limit = 10;

    /** Use effects */
    useEffect(() => {
        setOffset(0);
    }, [activeDocType]);

    /** Handlers */
    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    const docLabels = [
        { label: t('sideSheet.policy', { count: policyDocs?.length || 0 }), value: DocumentTypeView.Policy, disabled: !policyDocs?.length },
        {
            label: t('sideSheet.correspondence', { count: correspondenceDocs?.length || 0 }),
            value: DocumentTypeView.Correspondence,
            disabled: !correspondenceDocs?.length,
        },
    ];

    if (loadingDocuments) {
        return (
            <div className="p-8">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    } else {
        if ((!policyDocs && !correspondenceDocs) || (policyDocs?.length === 0 && correspondenceDocs?.length === 0))
            return (
                <SideSheetEmpty
                    icon={<PaperClipIcon width={50} height={50} className="text-gray-300" />}
                    header={t('sideSheet.documentsEmptyTitle')}
                    text={t('sideSheet.documentsEmptyText')}
                />
            );
        return (
            <div className="flex h-full flex-col">
                <div className="py-8.5 pl-10 pr-5">
                    <ButtonGroup
                        isFullWidth
                        activeValue={activeDocType}
                        toggle={value => {
                            setActiveDocType(value as DocumentTypeView);
                        }}
                        labels={docLabels}
                        size={'xxs'}
                        variant={'primary'}
                        groupLabel={t('overview.toggleResolvedVsOpend')}
                        hideLabel={true}
                    />
                </div>
                <div className="overflow-y-scroll">
                    {(activeDocType === DocumentTypeView.Policy
                        ? policyDocs.slice(offset, offset + limit)
                        : correspondenceDocs.slice(offset, offset + limit)
                    ).map(document => (
                        <SideSheetDocumentItem
                            key={`document-${document.documentID || document.documentId}`}
                            document={document}
                            carrier={caseDetails?.carrier}
                            activeDocType={activeDocType}
                        />
                    ))}
                </div>
                <div className="grow" />
                <div className="mx-auto my-6">
                    <PaginationControls
                        total={activeDocType === DocumentTypeView.Policy ? docTotal : correspondenceTotal}
                        limit={limit}
                        offset={offset}
                        goToPage={goToPage}
                    />
                </div>
            </div>
        );
    }
};
