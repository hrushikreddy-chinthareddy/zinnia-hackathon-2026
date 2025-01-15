import * as RadioGroup from '@radix-ui/react-radio-group';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import EventsLoader from '@deps/components/events-loader/events-loader';
import Label, { LabelVariant } from '@deps/components/label/label';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Toggle from '@deps/components/toggle/toggle';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import DocumentResultsPagination from '@deps/containers/subpages/documents-sub-page/documents-results-pagination';
import DocumentsResultsTable from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { useDocumentSearch } from '@deps/hooks/useDocumentSearch';
import { Case } from '@deps/models/case/case';
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
    const { isNewBusinessCase, policy } = useCaseActivityContext();
    const [showAll, setShowAll] = useState(isNewBusinessCase);
    const [docSource, setDocSource] = useState(DocumentTypeView.Policy as string);
    const limit = 25;
    const [offset, setOffset] = useState(0);

    // If there's a policy number on a non-new-business case, we want to get all policy docs
    // Otherwise, get all the docs associated with the case
    const documentSearchBody = useMemo<SearchRequest>(() => {
        return {
            parentCarrierCode: caseDetails.carrier,
            documentClassification:
                docSource === (DocumentTypeView.Policy as string)
                    ? SearchRequest.documentClassification.INBOUND
                    : SearchRequest.documentClassification.OUTBOUND,
            ...(showAll && policy ? { policyNumber: policy.policyNumber } : { zinniaLiveCaseId: caseDetails.id }),
        };
    }, [showAll, docSource, policy, caseDetails]);
    const [displayDocs, loadingDocuments, total, documentsStatusCode] = useDocumentSearch(documentSearchBody, limit, offset);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit, setOffset]
    );
    const setShowAllToggle = (val: boolean) => {
        setShowAll(val);
        setOffset(0);
    };

    const setDocSourceFilter = (val: string) => {
        setDocSource(val);
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
                            results={displayDocs ?? []}
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
