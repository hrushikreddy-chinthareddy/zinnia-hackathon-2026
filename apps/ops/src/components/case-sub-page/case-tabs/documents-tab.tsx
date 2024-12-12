import * as RadioGroup from '@radix-ui/react-radio-group';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import EventsLoader from '@deps/components/events-loader/events-loader';
import Label, { LabelVariant } from '@deps/components/label/label';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import Toggle from '@deps/components/toggle/toggle';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import DocumentResultsPagination from '@deps/containers/subpages/documents-sub-page/documents-results-pagination';
import DocumentsResultsTable from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { Case } from '@deps/models/case/case';
import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

// try to get any documentIds associated with this case.
// As we find more ways to associate documents with a case, we can add the ways to retrieve them here.
const getKnownCaseDocIds = (caseDetails: Case): string[] => {
    const knownDocIds = new Set<string>();

    const documentNumberId = caseDetails?.identifiers?.find(identifier => identifier.identifier === 'documentNumber');
    documentNumberId?.value && knownDocIds.add(documentNumberId?.value);

    // TODO - get children cases and do the same thing once children/secondary cases are implemented

    return Array.from(knownDocIds);
};

export default function DocumentsTab({ caseDetails }: { caseDetails: Case }) {
    const { t } = useTranslation();
    const knownCaseDocIds = getKnownCaseDocIds(caseDetails);
    const { policyDocs, correspondenceDocs, loadingDocuments, isNewBusinessCase, documentsStatusCode } = useCaseActivityContext();
    // Always show all docs for new business cases
    const [showAll, setShowAll] = useState(isNewBusinessCase);
    const [docSource, setDocSource] = useState(DocumentTypeView.Policy as string);
    const limit = 10;
    const [offset, setOffset] = useState(0);

    // add linkIcon to docs known to be linked
    const displayDocs = useMemo(() => {
        let docsToDisplay: DocumentWithSource[] = [];
        if (loadingDocuments) return docsToDisplay;
        docsToDisplay = policyDocs;
        if (docSource === DocumentTypeView.Correspondence) {
            docsToDisplay = correspondenceDocs;
        }

        if (showAll) return docsToDisplay;
        return docsToDisplay.filter(
            doc => knownCaseDocIds.includes(doc.documentID ?? (doc.documentId as string)) || knownCaseDocIds.includes(doc.documentNumber)
        );
    }, [policyDocs, correspondenceDocs, loadingDocuments, docSource, showAll, knownCaseDocIds]);

    const total = useMemo(() => {
        return displayDocs?.length || 0;
    }, [displayDocs]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit, setOffset]
    );

    const setDocSourceFilter = (val: string) => {
        setDocSource(val);
        setOffset(0);
    };
    const setShowAllToggle = (val: boolean) => {
        setShowAll(val);
        setOffset(0);
    };

    return (
        <CardContainer>
            <div>
                <Typography variant={TypographyVariant.H2}>{t(`caseOverview.tabs.documents`)}</Typography>
            </div>
            {documentsStatusCode === StatusCode.Forbidden ? (
                <UnauthorizedCard />
            ) : (
                <>
                    <div className="mt-6 flex w-full flex-col gap-6 md:flex-row md:justify-between">
                        <div className="flex flex-col gap-2">
                            <Label label={t('policy.documents.filterByCategory') as string} variant={LabelVariant.LabelSm} />
                            <RadioGroup.Root className="flex gap-2" onValueChange={setDocSourceFilter} value={docSource}>
                                <RadioGroup.Item className="chip" value={DocumentTypeView.Policy}>
                                    {t('policy.documents.received') as string}
                                </RadioGroup.Item>
                                <RadioGroup.Item className="chip" value={DocumentTypeView.Correspondence}>
                                    {t('policy.documents.sent') as string}
                                </RadioGroup.Item>
                            </RadioGroup.Root>
                        </div>
                        {!isNewBusinessCase && (
                            <Toggle
                                classes="md:self-end"
                                text={t('caseOverview.tabs.showAllPolicyDocuments') as string}
                                ariaLabel={t('caseOverview.tabs.showAllPolicyDocuments') as string}
                                value={showAll}
                                handleToggle={setShowAllToggle}
                            />
                        )}
                    </div>
                    {!loadingDocuments && (
                        <DocumentsResultsTable
                            carrierCode={caseDetails.carrier}
                            documentType={docSource as DocumentTypeView}
                            linkedDocumentIdentifiers={knownCaseDocIds}
                            results={displayDocs?.slice(offset, offset + limit) ?? []}
                            policyNumber={caseDetails.policyNumber}
                        />
                    )}
                    {loadingDocuments && (
                        <div className="mx-auto flex items-center justify-center gap-2">
                            <EventsLoader message={t('policy.documents.loadingDocuments')} />
                        </div>
                    )}
                    <DocumentResultsPagination goToPage={goToPage} limit={limit} offset={offset} total={total} loading={loadingDocuments} />
                </>
            )}
        </CardContainer>
    );
}
