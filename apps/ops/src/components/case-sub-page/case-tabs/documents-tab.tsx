import * as RadioGroup from '@radix-ui/react-radio-group';
import { useQuery } from '@tanstack/react-query';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import EventsLoader from '@deps/components/events-loader/events-loader';
import Label, { LabelVariant } from '@deps/components/label/label';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import DocumentResultsPagination from '@deps/containers/subpages/documents-sub-page/documents-results-pagination';
import DocumentsResultsTable from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import {
    OptimizelyVariableKey,
    useOptimizely,
} from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Case } from '@deps/models/case/case';
import {
    includeDocumentTypeForInboundSearch,
    excludeDocumentTypes,
    includeDocumentTypesInbound,
} from '@deps/models/case/document';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { isFeatureFlagVariableActive } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';

// try to get any documentIds associated with this case.
// As we find more ways to associate documents with a case, we can add the ways to retrieve them here.
const getKnownCaseDocIds = (caseDetails: Case): string[] => {
    const knownDocIds = new Set<string>();

    const documentNumberId = caseDetails?.identifiers?.find(
        (identifier) => identifier.identifier === 'documentNumber'
    );
    documentNumberId?.value && knownDocIds.add(documentNumberId?.value);

    // TODO MG: ticket for this TODO if needed
    // TODO - get children cases and do the same thing once children/secondary cases are implemented

    return Array.from(knownDocIds);
};

export default function DocumentsTab({
    caseDetails,
    policy,
}: {
    caseDetails: Case;
    policy: PolicyDetails | null;
}) {
    const { t } = useTranslation();
    const { isZinniaInternalProcessor } = usePermissionsContext();
    const knownCaseDocIds = getKnownCaseDocIds(caseDetails);
    const [docSource, setDocSource] = useState(
        DocumentTypeView.Policy as string
    );
    const limit = 25;
    const [caseOffset, setCaseOffset] = useState(0);
    const [policyOffset, setPolicyOffset] = useState(0);
    const { featureFlagVariables } = useOptimizely();
    const useV3 = isFeatureFlagVariableActive(
        featureFlagVariables,
        FEATURE_FLAG_VARIABLES.DOCUMENTS_V3_FEATURE_FLAG,
        OptimizelyVariableKey.Clients,
        caseDetails?.carrier?.toLocaleLowerCase() || ''
    );

    const caseDocumentSearchBody = useMemo<SearchRequest | null>(() => {
        if (!caseDetails?.id || !caseDetails?.carrier) {
            return null;
        }
        const documentClassification =
            docSource === (DocumentTypeView.Policy as string)
                ? SearchRequest.documentClassification.INBOUND
                : SearchRequest.documentClassification.OUTBOUND;

        const searchBody: SearchRequest = {
            parentCarrierCode: caseDetails.carrier,
            documentClassification,
            zinniaLiveCaseId: caseDetails.id,
            // @ts-expect-error: excludeDocumentTypes is missing from our types but most recent spec has other breaking changes
            excludeDocumentTypes,
        };

        if (
            documentClassification ===
                SearchRequest.documentClassification.INBOUND &&
            includeDocumentTypeForInboundSearch(caseDetails?.carrier) &&
            !isZinniaInternalProcessor // IMH-85894
        ) {
            searchBody.documentType = includeDocumentTypesInbound.join(',');
        }

        return searchBody;
    }, [caseDetails, docSource, isZinniaInternalProcessor]);

    const policyDocumentSearchBody = useMemo<SearchRequest | null>(() => {
        if (!caseDetails?.policyNumber || !caseDetails?.carrier) {
            return null;
        }
        const documentClassification =
            // TODO MG: This is duped above - add to more shareable util function
            docSource === (DocumentTypeView.Policy as string)
                ? SearchRequest.documentClassification.INBOUND
                : SearchRequest.documentClassification.OUTBOUND;

        const body: SearchRequest = {
            parentCarrierCode: caseDetails.carrier,
            documentClassification,
            policyNumber: caseDetails.policyNumber,
            planCode:
                caseDetails?.planCode ||
                caseDetails?.additionalData?.planCode ||
                policy?.planCode,
            // TODO MG: ticket to fix spec/types
            // @ts-expect-error: excludeDocumentTypes is missing from our types but most recent spec has other breaking changes
            excludeDocumentTypes,
        };

        if (
            documentClassification ===
                SearchRequest.documentClassification.INBOUND &&
            includeDocumentTypeForInboundSearch(caseDetails?.carrier) &&
            !isZinniaInternalProcessor // IMH-85894
        ) {
            body.documentType = includeDocumentTypesInbound.join(',');
        }

        return body;
    }, [caseDetails, policy, docSource, isZinniaInternalProcessor]);

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

    const {
        data: {
            data: caseDocuments = [],
            status: caseDocumentsStatusCode,
            total: totalCaseDocuments = 0,
        } = {},
        isLoading: loadingCaseDocuments,
    } = useQuery({
        queryKey: [
            'documentSearch',
            caseDocumentSearchBody,
            limit,
            caseOffset,
            useV3,
        ],
        queryFn: () =>
            getDocumentSearchResultsQuery(
                caseDocumentSearchBody,
                limit,
                caseOffset,
                useV3
            ),
    });

    const {
        data: {
            data: policyDocuments = [],
            status: policyDocumentsStatusCode,
            total: totalPolicyDocuments = 0,
        } = {},
        isLoading: loadingPolicyDocuments,
    } = useQuery({
        queryKey: [
            'documentSearch',
            policyDocumentSearchBody,
            limit,
            policyOffset,
            useV3,
        ],
        queryFn: () =>
            getDocumentSearchResultsQuery(
                policyDocumentSearchBody,
                limit,
                policyOffset,
                useV3
            ),
        enabled: !!policyDocumentSearchBody?.policyNumber,
    });

    return (
        <CardContainer>
            <div>
                <Typography variant={TypographyVariant.H2}>
                    {t(`caseOverview.tabs.documents`)}
                </Typography>
            </div>

            <>
                <div className="mt-6 flex w-full flex-col gap-6 md:flex-row md:justify-between">
                    <div className="flex flex-col gap-2">
                        <Label
                            label={
                                t('policy.documents.filterByCategory') as string
                            }
                            variant={LabelVariant.LabelSm}
                        />
                        <RadioGroup.Root
                            className="flex gap-2"
                            onValueChange={handleDocSourceChange}
                            value={docSource}
                        >
                            <RadioGroup.Item
                                className="chip"
                                value={DocumentTypeView.Policy}
                            >
                                {t('policy.documents.received') as string}
                            </RadioGroup.Item>
                            <RadioGroup.Item
                                className="chip"
                                value={DocumentTypeView.Correspondence}
                            >
                                {t('policy.documents.sent') as string}
                            </RadioGroup.Item>
                        </RadioGroup.Root>
                    </div>
                </div>

                {caseDocumentsStatusCode === StatusCode.Forbidden &&
                policyDocumentsStatusCode === StatusCode.Forbidden ? (
                    <UnauthorizedCard />
                ) : (
                    <>
                        {/* only show the case table if it has documents or there are no documents */}
                        {(!!caseDocuments?.length ||
                            !policyDocuments?.length) && (
                            <>
                                {/* only show titles if both tables are showing */}
                                {!!caseDocuments?.length &&
                                    !!policyDocuments?.length && (
                                        <Typography
                                            variant={TypographyVariant.H3}
                                            className="-mb-4 mt-6"
                                        >
                                            {
                                                t(
                                                    'caseOverview.tabs.caseDocuments'
                                                ) as string
                                            }
                                        </Typography>
                                    )}
                                {loadingCaseDocuments ? (
                                    <div className="mx-auto w-full flex items-center justify-center gap-2 my-8">
                                        <EventsLoader
                                            message={t(
                                                'policy.documents.loadingDocuments'
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <DocumentsResultsTable
                                        carrierCode={caseDetails.carrier}
                                        documentType={
                                            docSource as DocumentTypeView
                                        }
                                        linkedDocumentIdentifiers={
                                            knownCaseDocIds
                                        }
                                        results={caseDocuments ?? []}
                                        policyNumber={caseDetails.policyNumber}
                                        planCode={caseDetails.planCode}
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
                                    <Typography
                                        variant={TypographyVariant.H3}
                                        className="-mb-4 mt-6"
                                    >
                                        {
                                            t(
                                                'caseOverview.tabs.policyDocuments'
                                            ) as string
                                        }
                                    </Typography>
                                )}
                                {loadingPolicyDocuments ? (
                                    <div className="mx-auto w-full flex items-center justify-center gap-2 my-8">
                                        <EventsLoader
                                            message={t(
                                                'policy.documents.loadingDocuments'
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <DocumentsResultsTable
                                        carrierCode={caseDetails.carrier}
                                        documentType={
                                            docSource as DocumentTypeView
                                        }
                                        linkedDocumentIdentifiers={
                                            knownCaseDocIds
                                        }
                                        results={policyDocuments ?? []}
                                        policyNumber={caseDetails.policyNumber}
                                        planCode={caseDetails.planCode}
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
