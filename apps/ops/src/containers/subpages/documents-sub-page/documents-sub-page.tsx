import * as RadioGroup from '@radix-ui/react-radio-group';
import { useQuery } from '@tanstack/react-query';
import {
    SearchRequest,
    TaxformResponse,
} from '@zinnia/api-types/types/documents-v3';
import { Policy } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import EventsLoader from '@deps/components/events-loader/events-loader';
import FieldLabel from '@deps/components/fields/field-label';
import PageHeader from '@deps/components/page-header/page-header';
import SelectSimple from '@deps/components/select/select';
import { SimpleOption } from '@deps/components/select/select.helpers';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import CardContainer from '@deps/containers/card-container/card-container';
import {
    OptimizelyVariableKey,
    useOptimizely,
} from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { determineRange } from '@deps/helpers/numbers.helpers';
import {
    PolicyDocument,
    excludeDocumentTypes,
    includeDocumentTypesInbound,
    includeDocumentTypeForInboundSearch,
} from '@deps/models/case/document';
import { SearchTaxFormRequestBody } from '@deps/models/case/send-tax-forms';
import { searchTaxForms } from '@deps/queries/api/tax-forms';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import {
    DEFAULT_ERROR_STRING,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { isFeatureFlagVariableActive } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';

import DocumentResultsPagination from './documents-results-pagination';
import DocumentsResultsTable from './documents-results-table';
import TaxDocumentsTable from './tax-documents-table';

type DocumentsSubPageProps = {
    policy: Policy;
};

export type DocumentWithSource = PolicyDocument & {
    documentSource: DocumentTypeView;
};

// This is the maximum number of years retrievable by the API
const maxTaxYears = 5;

const getYearOptions = (policy: Policy): SimpleOption[] => {
    const defaultOption = { label: DEFAULT_ERROR_STRING, value: 'all' };
    const earliestPolicyDate = policy?.policyDates?.applicationDate
        ? dayjs(policy?.policyDates?.applicationDate, ZAHARA_API_DATE_FORMAT)
        : dayjs().year(dayjs().year() - 99);
    const range = determineRange(dayjs().year(), earliestPolicyDate.year() - 1);
    return [
        defaultOption,
        ...range.map((year) => ({ label: `${year}`, value: `${year}` })),
    ];
};

const NormalDocs = ({
    yearSelection,
    documentType,
    policy,
    isFirstYearSelected,
}: {
    yearSelection: string;
    documentType: string;
    policy: Policy;
    isFirstYearSelected: boolean;
}) => {
    const { t } = useTranslation();
    const { featureFlagVariables } = useOptimizely();
    const { isZinniaInternalProcessor } = usePermissionsContext();
    const useV3 = isFeatureFlagVariableActive(
        featureFlagVariables,
        FEATURE_FLAG_VARIABLES.DOCUMENTS_V3_FEATURE_FLAG,
        OptimizelyVariableKey.Clients,
        policy?.carrierId?.toLocaleLowerCase() || ''
    );
    const limit = 25;
    const [offset, setOffset] = useState(0);

    const searchParams = useMemo<SearchRequest | null>(() => {
        if (!policy?.carrierId) {
            return null;
        }
        let optionalParams = {};
        if (yearSelection !== 'all') {
            const startDate = dayjs()
                .year(Number(yearSelection))
                .month(0)
                .date(1);
            const documentStartDate = isFirstYearSelected
                ? startDate
                      .add(1, 'year')
                      .subtract(1100, 'days')
                      .format(ZAHARA_API_DATE_FORMAT) // this is the maximum range allowed
                : startDate.format(ZAHARA_API_DATE_FORMAT);
            const documentEndDate = startDate
                .add(1, 'year')
                .format(ZAHARA_API_DATE_FORMAT);

            optionalParams = { documentEndDate, documentStartDate };
        }

        const documentClassification =
            documentType === DocumentTypeView.Policy
                ? SearchRequest.documentClassification.INBOUND
                : SearchRequest.documentClassification.OUTBOUND;

        const params: SearchRequest = {
            ...optionalParams,
            documentClassification,
            policyNumber: policy.policyNumber,
            planCode: policy?.product?.planCode,
            parentCarrierCode: policy?.carrierId,
            orderBy: 'documentDate',
            orderByDirection: SearchRequest.orderByDirection.DESC,
            // @ts-expect-error: excludeDocumentTypes is missing from our types but most recent spec has other breaking changes
            excludeDocumentTypes,
        };

        if (
            documentClassification ===
                SearchRequest.documentClassification.INBOUND &&
            includeDocumentTypeForInboundSearch(policy?.carrierId) &&
            !isZinniaInternalProcessor // IMH-85894
        ) {
            params.documentType = includeDocumentTypesInbound.join(',');
        }

        return params;
    }, [
        documentType,
        policy,
        isFirstYearSelected,
        yearSelection,
        isZinniaInternalProcessor,
    ]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit, setOffset]
    );

    useEffect(() => {
        setOffset(0);
    }, [yearSelection, documentType]);

    const {
        data: {
            data: policyDocuments = [],
            status,
            total: totalPolicyDocuments = 0,
        } = {},
        isLoading,
    } = useQuery({
        queryKey: ['documentSearch', searchParams, limit, offset, useV3],
        queryFn: () =>
            getDocumentSearchResultsQuery(searchParams, limit, offset, useV3),
        enabled: !!policy?.policyNumber,
    });

    if (status === StatusCode.Forbidden) {
        return <UnauthorizedCard />;
    }
    if (isLoading) {
        return (
            <div className="mx-auto flex items-center justify-center gap-2">
                <EventsLoader
                    message={t('policy.documents.loadingDocuments')}
                />
            </div>
        );
    }

    return (
        <>
            {isLoading ? (
                <EventsLoader
                    message={t('policy.documents.loadingDocuments')}
                />
            ) : (
                <DocumentsResultsTable
                    carrierCode={policy.carrierId ?? ''}
                    documentType={documentType as DocumentTypeView}
                    policyNumber={policy.policyNumber ?? ''}
                    results={policyDocuments ?? []}
                />
            )}
            <DocumentResultsPagination
                goToPage={goToPage}
                loading={isLoading}
                limit={limit}
                total={totalPolicyDocuments}
                offset={offset}
                className="pb-[120px] lg:pb-0"
            />
        </>
    );
};

const TaxDocs = ({
    yearSelection,
    policy,
    isFirstYearSelected,
}: {
    yearSelection: string;
    policy: Policy;
    isFirstYearSelected: boolean;
}) => {
    const limit = 25;
    const { t } = useTranslation();

    const [docs, setDocs] = useState<TaxformResponse[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<StatusCode | null>(null);
    const [total, setTotal] = useState<number>(0);
    const { featureFlagVariables } = useOptimizely();

    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const searchTaxDocs = async () => {
            setLoading(true);
            setOffset(0);
            setTotal(0);
            const taxQueryParams: SearchTaxFormRequestBody = {
                clientCode: policy.carrierId ?? '',
                contractNumber: policy.policyNumber ?? '',
                planCode: policy?.product?.planCode,
            };
            if (yearSelection === 'all' || isFirstYearSelected) {
                taxQueryParams.numYears = maxTaxYears;
            } else {
                taxQueryParams.taxYear = Number(yearSelection);
            }

            const useV3 = isFeatureFlagVariableActive(
                featureFlagVariables,
                FEATURE_FLAG_VARIABLES.DOCUMENTS_V3_FEATURE_FLAG,
                OptimizelyVariableKey.Clients,
                policy?.carrierId?.toLocaleLowerCase() || ''
            );

            const response = await searchTaxForms(taxQueryParams, useV3);
            setDocs(response?.data?.items ?? null);
            setTotal(response?.data?.count ?? 0);
            setLoading(false);
            setStatus(response?.error?.status ?? null);
        };

        searchTaxDocs();
    }, [yearSelection, policy, isFirstYearSelected, featureFlagVariables]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit, setOffset]
    );

    const paginatedDocs =
        useMemo(() => {
            return docs?.slice(offset, offset + limit);
        }, [docs, offset]) ?? [];

    return (
        <>
            {status === StatusCode.Forbidden ? (
                <UnauthorizedCard />
            ) : (
                <>
                    {!loading && (
                        <TaxDocumentsTable
                            carrierCode={policy.carrierId ?? ''}
                            planCode={policy?.product?.planCode}
                            policyNumber={policy.policyNumber ?? ''}
                            results={paginatedDocs}
                        />
                    )}
                    {loading && (
                        <div className="mx-auto flex items-center justify-center gap-2">
                            <EventsLoader
                                message={t('policy.documents.loadingDocuments')}
                            />
                        </div>
                    )}
                    <DocumentResultsPagination
                        goToPage={goToPage}
                        loading={loading}
                        limit={limit}
                        total={total}
                        offset={offset}
                        className="pb-[120px] lg:pb-0"
                    />
                </>
            )}
        </>
    );
};

export default function DocumentsSubPage({ policy }: DocumentsSubPageProps) {
    const { t } = useTranslation();

    const [documentType, setDocumentType] = useState(
        DocumentTypeView.Policy as string
    );

    const yearOptions = getYearOptions(policy);
    const [yearSelection, setYearSelection] = useState<string>(
        dayjs().year().toString()
    );

    const isFirstYearSelected = useMemo(() => {
        return yearSelection === yearOptions?.[yearOptions?.length - 1]?.value;
    }, [yearSelection, yearOptions]);

    const handleYearSelection = (val: string) => {
        if (val === yearSelection) return;
        setYearSelection(val);
    };

    return (
        <>
            <div className="flex self-stretch border-b-2 border-gray-200">
                <PageHeader
                    headerText={t('pageHeader.documents.headerText') as string}
                />
            </div>
            <CardContainer>
                <div className="max-w-[200px]">
                    <SelectSimple
                        label={t('policy.documents.filter') as string}
                        onChange={handleYearSelection}
                        options={yearOptions}
                        value={`${yearSelection}`}
                    />
                </div>
                <div className="w-fulls mt-4">
                    <FieldLabel
                        label={t('policy.documents.filterByCategory') as string}
                    />
                    <RadioGroup.Root
                        aria-label={
                            t('policy.documents.filterByCategory') as string
                        }
                        className="flex gap-2"
                        onValueChange={setDocumentType}
                        value={documentType}
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
                        <RadioGroup.Item className="chip" value={'tax-forms'}>
                            {t('policy.documents.taxDocuments') as string}
                        </RadioGroup.Item>
                    </RadioGroup.Root>
                </div>
                {documentType !== 'tax-forms' ? (
                    <NormalDocs
                        yearSelection={yearSelection}
                        documentType={documentType}
                        policy={policy}
                        isFirstYearSelected={isFirstYearSelected}
                    />
                ) : (
                    <TaxDocs
                        yearSelection={yearSelection}
                        policy={policy}
                        isFirstYearSelected={isFirstYearSelected}
                    />
                )}
            </CardContainer>
        </>
    );
}
