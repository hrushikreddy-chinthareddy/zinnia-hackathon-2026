import * as RadioGroup from '@radix-ui/react-radio-group';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import EventsLoader from '@deps/components/events-loader/events-loader';
import Label, { LabelVariant } from '@deps/components/label/label';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import DocumentResultsPagination from '@deps/containers/subpages/documents-sub-page/documents-results-pagination';
import DocumentsResultsTable from '@deps/containers/subpages/documents-sub-page/documents-results-table';
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
    const [docSource, setDocSource] = useState(DocumentTypeView.Policy as string);
    const limit = 25;
    const [caseOffset, setCaseOffset] = useState(0);
    const [policyOffset, setPolicyOffset] = useState(0);
    const caseDocumentSearchBody = useMemo<SearchRequest | null>(() => {
        return {
            parentCarrierCode: caseDetails.carrier,
            documentClassification:
                docSource === (DocumentTypeView.Policy as string)
                    ? SearchRequest.documentClassification.INBOUND
                    : SearchRequest.documentClassification.OUTBOUND,
            zinniaLiveCaseId: caseDetails.id,
        };
    }, [caseDetails, docSource]);

    const policyDocumentSearchBody = useMemo<SearchRequest | null>(() => {
        return {
            parentCarrierCode: caseDetails.carrier,
            documentClassification:
                docSource === (DocumentTypeView.Policy as string)
                    ? SearchRequest.documentClassification.INBOUND
                    : SearchRequest.documentClassification.OUTBOUND,
            policyNumber: caseDetails.policyNumber,
        };
    }, [caseDetails, docSource]);

    const handleDocSourceChange = (value: string) => {
        setCaseOffset(0);
        setPolicyOffset(0);
        setDocSource(value);
    };

    const goToCasePage = useCallback(
        (pageNumber: number) => {
            setCaseOffset((pageNumber - 1) * limit);
        },
        [limit, setCaseOffset]
    );

    const goToPolicyPage = useCallback(
        (pageNumber: number) => {
            setPolicyOffset((pageNumber - 1) * limit);
        },
        [limit, setPolicyOffset]
    );

    const [caseDocuments, loadingCaseDocuments, totalCaseDocuments, caseDocumentsStatusCode] = useDocumentSearch(
        caseDocumentSearchBody,
        limit,
        caseOffset
    );
    const [policyDocuments, loadingPolicyDocuments, totalPolicyDocuments, policyDocumentsStatusCode] = useDocumentSearch(
        policyDocumentSearchBody,
        limit,
        policyOffset
    );

    return (
        <CardContainer>
            <div>
                <Typography variant={TypographyVariant.H2}>{t(`caseOverview.tabs.documents`)}</Typography>
            </div>

            <>
                <div className="mt-6 flex w-full flex-col gap-6 md:flex-row md:justify-between">
                    <div className="flex flex-col gap-2">
                        <Label label={t('policy.documents.filterByCategory') as string} variant={LabelVariant.LabelSm} />
                        <RadioGroup.Root className="flex gap-2" onValueChange={handleDocSourceChange} value={docSource}>
                            <RadioGroup.Item className="chip" value={DocumentTypeView.Policy}>
                                {t('policy.documents.received') as string}
                            </RadioGroup.Item>
                            <RadioGroup.Item className="chip" value={DocumentTypeView.Correspondence}>
                                {t('policy.documents.sent') as string}
                            </RadioGroup.Item>
                        </RadioGroup.Root>
                    </div>
                </div>

                {caseDocumentsStatusCode === StatusCode.Forbidden && policyDocumentsStatusCode === StatusCode.Forbidden ? (
                    <UnauthorizedCard />
                ) : (
                    <>
                        {/* only show the case table if it has documents or there are no documents */}
                        {(!!caseDocuments?.length || !policyDocuments?.length) && (
                            <>
                                {/* only show titles if both tables are showing */}
                                {!!caseDocuments?.length && !!policyDocuments?.length && (
                                    <Typography variant={TypographyVariant.H3} className="-mb-4 mt-6">
                                        {t('caseOverview.tabs.caseDocuments') as string}
                                    </Typography>
                                )}
                                {loadingCaseDocuments ? (
                                    <div className="mx-auto w-full flex items-center justify-center gap-2 my-8">
                                        <EventsLoader message={t('policy.documents.loadingDocuments')} />
                                    </div>
                                ) : (
                                    <DocumentsResultsTable
                                        carrierCode={caseDetails.carrier}
                                        documentType={docSource as DocumentTypeView}
                                        linkedDocumentIdentifiers={knownCaseDocIds}
                                        results={caseDocuments ?? []}
                                        policyNumber={caseDetails.policyNumber}
                                    />
                                )}

                                <DocumentResultsPagination
                                    goToPage={goToCasePage}
                                    limit={limit}
                                    offset={caseOffset}
                                    total={totalCaseDocuments}
                                    loading={loadingCaseDocuments}
                                />
                            </>
                        )}
                        {/* only show policy documents if there are policy documents */}
                        {!!policyDocuments?.length && (
                            <>
                                {/* only show titles if both tables are showing */}
                                {!!caseDocuments?.length && (
                                    <Typography variant={TypographyVariant.H3} className="-mb-4 mt-6">
                                        {t('caseOverview.tabs.policyDocuments') as string}
                                    </Typography>
                                )}
                                {loadingPolicyDocuments ? (
                                    <div className="mx-auto w-full flex items-center justify-center gap-2 my-8">
                                        <EventsLoader message={t('policy.documents.loadingDocuments')} />
                                    </div>
                                ) : (
                                    <DocumentsResultsTable
                                        carrierCode={caseDetails.carrier}
                                        documentType={docSource as DocumentTypeView}
                                        linkedDocumentIdentifiers={knownCaseDocIds}
                                        results={policyDocuments ?? []}
                                        policyNumber={caseDetails.policyNumber}
                                    />
                                )}
                                <DocumentResultsPagination
                                    goToPage={goToPolicyPage}
                                    limit={limit}
                                    offset={policyOffset}
                                    total={totalPolicyDocuments}
                                    loading={loadingPolicyDocuments}
                                />
                            </>
                        )}
                    </>
                )}
            </>
        </CardContainer>
    );
}
