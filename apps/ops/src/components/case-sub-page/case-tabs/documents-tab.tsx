import * as RadioGroup from '@radix-ui/react-radio-group';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

const DocumentsResults = ({
    searchType,
    caseDetails,
    knownCaseDocIds,
    docSource,
}: {
    searchType: 'policyNumber' | 'zinniaLiveCaseId';
    caseDetails: Case;
    knownCaseDocIds: string[];
    docSource: string;
}) => {
    const { t } = useTranslation();
    const limit = 25;
    const [offset, setOffset] = useState(0);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit, setOffset]
    );

    useEffect(() => {
        setOffset(0);
    }, [docSource]);
    const documentSearchBody = useMemo<SearchRequest | null>(() => {
        if (searchType === 'policyNumber' && !caseDetails.policyNumber) {
            return null;
        }
        return {
            parentCarrierCode: caseDetails.carrier,
            documentClassification:
                docSource === (DocumentTypeView.Policy as string)
                    ? SearchRequest.documentClassification.INBOUND
                    : SearchRequest.documentClassification.OUTBOUND,
            ...(searchType === 'policyNumber' ? { policyNumber: caseDetails.policyNumber } : { zinniaLiveCaseId: caseDetails.id }),
        };
    }, [caseDetails, docSource, searchType]);

    const [documents, loadingDocuments, totalDocuments, documentsStatusCode] = useDocumentSearch(documentSearchBody, limit, offset);

    return (
        <>
            {documentsStatusCode === StatusCode.Forbidden ? (
                <UnauthorizedCard />
            ) : (
                <>
                    {!loadingDocuments && (
                        <DocumentsResultsTable
                            carrierCode={caseDetails.carrier}
                            captionTitle={
                                t(
                                    searchType === 'policyNumber' ? 'caseOverview.tabs.policyDocuments' : `caseOverview.tabs.caseDocuments`
                                ) as string
                            }
                            documentType={docSource as DocumentTypeView}
                            linkedDocumentIdentifiers={knownCaseDocIds}
                            results={documents ?? []}
                            policyNumber={caseDetails.policyNumber}
                        />
                    )}
                    {loadingDocuments && (
                        <div className="mx-auto flex items-center justify-center gap-2 my-8">
                            <EventsLoader message={t('policy.documents.loadingDocuments')} />
                        </div>
                    )}
                    <DocumentResultsPagination
                        goToPage={goToPage}
                        limit={limit}
                        offset={offset}
                        total={totalDocuments}
                        loading={loadingDocuments}
                    />
                </>
            )}
        </>
    );
};

export default function DocumentsTab({ caseDetails }: { caseDetails: Case }) {
    const { t } = useTranslation();
    const knownCaseDocIds = getKnownCaseDocIds(caseDetails);
    const [docSource, setDocSource] = useState(DocumentTypeView.Policy as string);

    const setDocSourceFilter = (val: string) => {
        setDocSource(val);
    };

    return (
        <CardContainer>
            <div>
                <Typography variant={TypographyVariant.H2}>{t(`caseOverview.tabs.documents`)}</Typography>
            </div>

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
                </div>
                <DocumentsResults
                    searchType="zinniaLiveCaseId"
                    caseDetails={caseDetails}
                    knownCaseDocIds={knownCaseDocIds}
                    docSource={docSource}
                />
                <DocumentsResults
                    searchType="policyNumber"
                    caseDetails={caseDetails}
                    knownCaseDocIds={knownCaseDocIds}
                    docSource={docSource}
                />
            </>
        </CardContainer>
    );
}
