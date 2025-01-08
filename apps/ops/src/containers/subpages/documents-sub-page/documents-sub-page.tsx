import * as RadioGroup from '@radix-ui/react-radio-group';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import EventsLoader from '@deps/components/events-loader/events-loader';
import FieldLabel from '@deps/components/fields/field-label';
import PageHeader from '@deps/components/page-header/page-header';
import SelectSimple from '@deps/components/select/select';
import { SimpleOption } from '@deps/components/select/select.helpers';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import CardContainer from '@deps/containers/card-container/card-container';
import { determineRange } from '@deps/helpers/numbers.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { useDocumentSearch } from '@deps/hooks/useDocumentSearch';
import { PolicyDocument } from '@deps/models/case/document';
import { Policy } from '@deps/models/policy/sor-policy';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { DEFAULT_ERROR_STRING, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import DocumentResultsPagination from './documents-results-pagination';
import DocumentsResultsTable from './documents-results-table';

type DocumentsSubPageProps = {
    policy: Policy;
};

export type DocumentWithSource = PolicyDocument & { documentSource: DocumentTypeView };

const getYearOptions = (policy: Policy): SimpleOption[] => {
    const defaultOption = { label: DEFAULT_ERROR_STRING, value: 'all' };
    const earliestPolicyDate = policy?.policyDates?.applicationDate
        ? dayjs(policy?.policyDates?.applicationDate, ZAHARA_API_DATE_FORMAT)
        : dayjs().year(dayjs().year() - 99);
    const range = determineRange(dayjs().year(), earliestPolicyDate.year() - 1);
    return [defaultOption, ...range.map(year => ({ label: `${year}`, value: `${year}` }))];
};
export default function DocumentsSubPage({ policy }: DocumentsSubPageProps) {
    const { t } = useTranslation();
    const { breadcrumb } = useBreadcrumb();

    const [documentType, setDocumentType] = useState(DocumentTypeView.Policy as string);
    const limit = 25;
    const [offset, setOffset] = useState(0);
    const yearOptions = getYearOptions(policy);
    const [yearSelection, setYearSelection] = useState<string>(dayjs().year().toString());
    const searchParams = useMemo(() => {
        let optionalParams = {};
        if (yearSelection !== 'all') {
            const isFirstYearSelected = yearOptions[yearOptions.length - 1].value === yearSelection;
            const startDate = dayjs().year(Number(yearSelection)).month(0).date(1);
            const documentStartDate = isFirstYearSelected
                ? startDate.add(1, 'year').subtract(1100, 'days').format(ZAHARA_API_DATE_FORMAT) // this is the maximum range allowed
                : startDate.format(ZAHARA_API_DATE_FORMAT);
            const documentEndDate = startDate.add(1, 'year').format(ZAHARA_API_DATE_FORMAT);

            optionalParams = { documentEndDate, documentStartDate };
        }
        return {
            ...optionalParams,
            documentClassification:
                documentType === DocumentTypeView.Policy
                    ? SearchRequest.documentClassification.INBOUND
                    : SearchRequest.documentClassification.OUTBOUND,
            policyNumber: policy.policyNumber,
            parentCarrierCode: policy?.carrierId,
            orderBy: 'documentDate',
            orderByDirection: SearchRequest.orderByDirection.DESC,
        };
    }, [documentType, policy, yearOptions, yearSelection]);
    const [results, loading, total, status] = useDocumentSearch(searchParams, limit, offset);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit, setOffset]
    );

    const handleYearSelection = (val: string) => {
        if (val === yearSelection) return;
        setOffset(0);
        setYearSelection(val);
    };

    return (
        <div className="h-full rounded bg-white text-gray-900 shadow-elevation-light-04">
            <div className="flex self-stretch border-b-2 border-gray-100">
                <PageHeader
                    headerText={t('pageHeader.documents.headerText') as string}
                    breadcrumbText={breadcrumb?.text}
                    breadcrumbUrl={breadcrumb?.url}
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
                    <FieldLabel label={t('policy.documents.filterByCategory') as string} />
                    <RadioGroup.Root
                        aria-label={t('policy.documents.filterByCategory') as string}
                        className="flex gap-2"
                        onValueChange={setDocumentType}
                        value={documentType}
                    >
                        <RadioGroup.Item className="chip" value={DocumentTypeView.Policy}>
                            {t('policy.documents.received') as string}
                        </RadioGroup.Item>
                        <RadioGroup.Item className="chip" value={DocumentTypeView.Correspondence}>
                            {t('policy.documents.sent') as string}
                        </RadioGroup.Item>
                    </RadioGroup.Root>
                </div>
                {status === StatusCode.Forbidden ? (
                    <UnauthorizedCard />
                ) : (
                    <>
                        {!loading && (
                            <DocumentsResultsTable
                                carrierCode={policy.carrierId ?? ''}
                                documentType={documentType as DocumentTypeView}
                                policyNumber={policy.policyNumber ?? ''}
                                results={results ?? []}
                            />
                        )}
                        {loading && (
                            <div className="mx-auto flex items-center justify-center gap-2">
                                <EventsLoader message={t('policy.documents.loadingDocuments')} />
                            </div>
                        )}
                        <DocumentResultsPagination goToPage={goToPage} loading={loading} limit={limit} total={total} offset={offset} />
                    </>
                )}
            </CardContainer>
        </div>
    );
}
