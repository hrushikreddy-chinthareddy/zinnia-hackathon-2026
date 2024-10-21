import { Session, getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import FilterButton from '@deps/components/filter-button/filter-button';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import NoNavLayout from '@deps/components/no-nav-layout';
import { PageLoader, PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import SearchBar from '@deps/components/search/search-bar';
import SelectSimple from '@deps/components/select/select';
import { CaseResultTable } from '@deps/components/table/case-result-table';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import StatusFilter from '@deps/containers/active-filters/status-filter';
import {
    CaseManagementFiltersContext,
    CaseSearchAdditionalFilters,
    CaseSearchFilters,
    initialFilters,
    caseSearchPageSizeOptions,
    CaseTableData,
} from '@deps/contexts/CaseManagementFilters';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getAdvisorsExcelCaseSearchParams, getAdvisorsExcelCaseStatsParams } from '@deps/helpers/advisors-excel';
import {
    formatCaseTotals,
    getAdditionalFilters,
    getSearchValueObject,
    isSearchValueObjectEmpty,
    toggleLabels,
} from '@deps/helpers/case-management';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { storage } from '@deps/helpers/sessionStorage.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Statuses } from '@deps/models/case/case';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseStats, getCases } from '@deps/queries/api/cases';
import { checkTupleSsr, getCarrierListServerSSR } from '@deps/queries/api/fga';
import { CaseSearchQuery, CaseStatsQuery } from '@deps/queries/cases';
import { FgaRelation } from '@deps/types/fga';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import nextI18nextConfig from 'next-i18next.config';

import useCaseFilterQueryStore from './caseFilterQueryStore';

// Lazy Loaded Components
const SideSheetRefineResults = dynamic(() => import('@deps/containers/side-sheet-refine-results/side-sheet-refine-results'));
const CaseSearchResultsEmptyCard = dynamic(
    () => import('@deps/containers/search-results/search-results-empty-card/case-search-results-empty-card')
);
const ActiveFilters = dynamic(() => import('@deps/containers/active-filters/active-filters'));
const SearchResultsErrorCard = dynamic(() => import('@deps/containers/search-results/search-results-error-card/search-results-error-card'));
const PaginationControls = dynamic(() => import('@deps/components/pagination/pagination'));
const PageSizeControls = dynamic(() => import('@deps/components/pagination/page-size/page-size'));

interface CaseManagementDashboardProps extends SegmentTrackedPageProps {
    authorizedCarriers: string[];
    isAdvisorsExcel: boolean;
}

const CaseManagementDashboard = ({ authorizedCarriers, isAdvisorsExcel, user }: CaseManagementDashboardProps) => {
    const [caseManagementFilters, setCaseManagementFilters] = useCaseFilterQueryStore();
    const [loadedStoredFilters, setLoadedStoredFilters] = useState(false);

    const { t } = useTranslation();

    useSegmentPageTracker(user, SegmentPageName.CaseManagementDashboard);

    // Refs
    const topDiv = useRef<HTMLDivElement | null>(null);
    const bottomDiv = useRef<HTMLDivElement | null>(null);

    const [caseTableData, setCaseTableData] = useState<CaseTableData>({ cases: [], total: 0, loading: true, error: false });
    const [caseTotals, setCaseTotals] = useState({
        All: 0,
        [Statuses.InProgress]: 0,
        [Statuses.Exception]: 0,
    });

    // Data Fetcher(s)
    const fetchCaseStats = useCallback(async () => {
        // We don't want to use the status filters when getting counts for the search results
        const { caseStatus, notInCaseStatus, ...additionalFilters } = getAdditionalFilters(caseManagementFilters.additionalFilters);

        const searchValueObject = getSearchValueObject(caseManagementFilters.searchValue, caseManagementFilters.toggleValue);

        let caseStatsRequest: CaseStatsQuery = {
            ...additionalFilters,
            ...searchValueObject,
            groupBy: ['caseStatus'],
        };

        if (isAdvisorsExcel) {
            const advisorsExcelParams = getAdvisorsExcelCaseStatsParams();

            caseStatsRequest = {
                ...caseStatsRequest,
                ...advisorsExcelParams,
            };
        }

        try {
            const response = await getCaseStats(caseStatsRequest);

            if ('stats' in response) {
                const hasSearch = !isSearchValueObjectEmpty(searchValueObject);
                const newResult = formatCaseTotals(response.count, response.stats[0], hasSearch);

                setCaseTotals(newResult);
            } else {
                throw new Error(response?.data?.err ? response.data.err : 'Error fetching case stats');
            }
        } catch (error) {
            console.error(error);
            setCaseTotals({
                All: 0,
                [Statuses.InProgress]: 0,
                [Statuses.Exception]: 0,
            });
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caseManagementFilters.additionalFilters, caseManagementFilters.searchValue]); // for caseManagementFilters.toggleValue

    const fetchCases = useCallback(async () => {
        try {
            const searchValueObject = getSearchValueObject(caseManagementFilters.searchValue, caseManagementFilters.toggleValue);

            let additionalFilters = getAdditionalFilters(caseManagementFilters.additionalFilters);

            // DEPU-2835 - temporary work around for Advisor Excel
            if (isAdvisorsExcel) {
                const advisorsExcelParams = getAdvisorsExcelCaseSearchParams();

                additionalFilters = {
                    ...additionalFilters,
                    ...advisorsExcelParams,
                };
            }

            const updatedRequest: CaseSearchQuery = {
                ...additionalFilters,
                ...searchValueObject,
                limit: caseManagementFilters.limit,
                offset: caseManagementFilters.offset,
                sortDirection: caseManagementFilters.sortDirection,
                sortBy: caseManagementFilters.sortBy || 'createdAt',
            };

            const response = await getCases(updatedRequest);

            if (!response) {
                throw new Error('Error fetching cases: No response');
            }
            // Check for error in fetch response
            if ('total' in response) {
                setCaseTableData({
                    cases: response.data,
                    total: response.total,
                    loading: false,
                    error: false,
                });
            } else {
                throw new Error(response.data.err ? response.data.err : 'Error fetching cases');
            }
        } catch (error) {
            console.error(error);
            setCaseTableData({
                cases: [],
                total: 0,
                loading: false,
                error: true,
            });
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // for caseManagementFilters.toggleValue
        caseManagementFilters.searchValue,
        caseManagementFilters.additionalFilters,
        caseManagementFilters.offset,
        caseManagementFilters.limit,
        caseManagementFilters.sortDirection,
    ]);

    // useEffect(s)
    useEffect(() => {
        // anytime the filters change, included loaded from storage
        // set table data to show no data and loading state
        setCaseTableData(prevTableData => ({ ...prevTableData, total: 0, loading: true, error: false }));

        // Only after the page has mounted, set session storage filters and fetch
        if (loadedStoredFilters) {
            // Fetch cases
            fetchCases();

            // Fetch number of cases for Total, In Progress and Exception tiles
            fetchCaseStats();
        }
    }, [loadedStoredFilters, fetchCaseStats, fetchCases]);

    useEffect(() => {
        if (loadedStoredFilters) {
            storage.setItem('CASE_MANAGEMENT_FILTERS', {
                ...caseManagementFilters,
                additionalFilters: {
                    ...caseManagementFilters.additionalFilters,
                    processTypes: Array.from(caseManagementFilters.additionalFilters.processTypes),
                    products: Array.from(caseManagementFilters.additionalFilters.products),
                    requestSubType: Array.from(caseManagementFilters.additionalFilters.requestSubType),
                },
            });
        }
    }, [caseManagementFilters, loadedStoredFilters]);

    useEffect(() => {
        const filtersFromStorage = storage.getItem('CASE_MANAGEMENT_FILTERS') as CaseSearchFilters;
        if (filtersFromStorage) {
            const processTypesFromStorage =
                typeof filtersFromStorage?.additionalFilters?.processTypes?.[Symbol.iterator] === 'function'
                    ? filtersFromStorage.additionalFilters.processTypes
                    : [];
            filtersFromStorage.additionalFilters.processTypes = new Set(processTypesFromStorage);

            // Original products were an empty object.  Checking to make sure type is iterable before creating a set from them
            const productFromStorage =
                typeof filtersFromStorage?.additionalFilters?.products?.[Symbol.iterator] === 'function'
                    ? filtersFromStorage.additionalFilters.products
                    : [];
            filtersFromStorage.additionalFilters.products = new Set(productFromStorage);
            // Original products were an empty object.  Checking to make sure type is iterable before creating a set from them
            const requestSubTypeFromStorage =
                typeof filtersFromStorage?.additionalFilters?.requestSubType?.[Symbol.iterator] === 'function'
                    ? filtersFromStorage.additionalFilters.requestSubType
                    : [];
            filtersFromStorage.additionalFilters.requestSubType = new Set(requestSubTypeFromStorage);
            setCaseManagementFilters(filtersFromStorage);
        }

        setLoadedStoredFilters(true);

        const syncScroll = (source: React.RefObject<HTMLDivElement>, target: React.RefObject<HTMLDivElement>) => {
            if (source.current === null || target.current === null) return;
            target.current.scrollLeft = source.current.scrollLeft;
        };

        const handleScrollTop = () => syncScroll(topDiv, bottomDiv);
        const handleScrollBottom = () => syncScroll(bottomDiv, topDiv);

        const topCurrent = topDiv.current;
        const bottomCurrent = bottomDiv.current;

        if (topCurrent) {
            topCurrent.addEventListener('scroll', handleScrollTop);
        }

        if (bottomCurrent) {
            bottomCurrent.addEventListener('scroll', handleScrollBottom);
        }

        return () => {
            if (topCurrent) {
                topCurrent.removeEventListener('scroll', handleScrollTop);
            }

            if (bottomCurrent) {
                bottomCurrent.removeEventListener('scroll', handleScrollBottom);
            }
        };
    }, []);

    // Handler(s)
    const resetAllFilters = () => {
        const { searchValue, toggleValue } = caseManagementFilters;

        setCaseManagementFilters({
            ...initialFilters,
            searchValue,
            toggleValue,
        });
    };

    const removeAdditionalFilter = (filters: CaseSearchAdditionalFilters) =>
        setCaseManagementFilters(prevFilters => ({ ...prevFilters, additionalFilters: filters, offset: 0 }));

    const handleSearch = (value: SearchViewQuery) =>
        setCaseManagementFilters(prevFilters => ({ ...prevFilters, searchValue: value, offset: 0 }));

    const handleToggle = (value: PolicySearchKeys) => setCaseManagementFilters(prevFilters => ({ ...prevFilters, toggleValue: value }));

    // Memoized Component(s)
    const searchBar = useMemo(() => {
        return (
            <SearchBar
                searchValue={caseManagementFilters.searchValue}
                onSearch={handleSearch}
                toggleLabels={toggleLabels}
                initialToggleValue={caseManagementFilters.toggleValue}
                onToggle={handleToggle}
            />
        );
    }, [caseManagementFilters.searchValue, caseManagementFilters.toggleValue]);

    const pageSizeDropdown = useMemo(() => {
        return (
            <PageSizeControls
                options={caseSearchPageSizeOptions}
                value={`${caseManagementFilters.limit}`}
                handleChange={value => {
                    setCaseManagementFilters(prevFilters => ({
                        ...prevFilters,
                        limit: Number(value),
                        offset: 0,
                    }));
                    window.scrollTo(0, 0);
                }}
            />
        );
    }, [caseManagementFilters.limit]);

    const paginationControls = useMemo(() => {
        const goToPage = (pageNumber: number) => {
            setCaseManagementFilters(prevFilters => ({
                ...prevFilters,
                offset: (pageNumber - 1) * caseManagementFilters.limit,
            }));

            window.scrollTo(0, 0);
        };

        return (
            <PaginationControls
                total={caseTableData.total}
                limit={caseManagementFilters.limit}
                offset={caseManagementFilters.offset}
                goToPage={goToPage}
            />
        );
    }, [caseTableData.total, caseManagementFilters.limit, caseManagementFilters.offset]);

    const tableContent = useMemo(() => {
        const { cases, loading, error } = caseTableData;

        if (loading) return <PageLoader variant={PageLoaderVariant.Center} />;
        if (error) return <SearchResultsErrorCard />;
        if (!cases || cases.length === 0) return <CaseSearchResultsEmptyCard />;

        return (
            <>
                <CaseResultTable cases={cases} />
            </>
        );
    }, [caseTableData]);

    // Sidesheet Support
    const sideSheet = useSideSheetContext();
    const openRefineResultsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            t('caseManagementDashboard.refineResults') as string,
            <SideSheetRefineResults
                authorizedCarriers={authorizedCarriers}
                filters={caseManagementFilters.additionalFilters}
                isAdvisorsExcel={isAdvisorsExcel}
                setCaseManagementFilters={setCaseManagementFilters}
                closeSideSheet={() => sideSheet.handleOpen(false)}
            />
        );
        sideSheet.handleOpen(true);
    };

    // JSX
    return (
        <CaseManagementFiltersContext.Provider value={[caseManagementFilters, setCaseManagementFilters]}>
            <PageHead titleKey="caseManagement" />
            <NoNavLayout fullHeight={true}>
                <div className="flex flex-col items-center xl:items-start">
                    <Typography variant={TypographyVariant.H1}>{t('caseManagementDashboard.h1')}</Typography>
                    {searchBar}
                </div>

                <div className="prose min-h-screen">
                    <div className="early-col-break my-6 flex flex-col items-start justify-start sm:flex-row sm:items-center sm:justify-between">
                        <div className="early-break mb-4 flex flex-row items-center justify-start sm:mb-0 sm:justify-between">
                            <p className="mr-2 whitespace-nowrap font-primary text-2xl font-normal text-gray-900">
                                {`${t('caseManagementDashboard.results')} (${wholeNumberFormatify(caseTableData.total)}${
                                    caseTableData.total === 10000 ? '+' : ''
                                })`}
                            </p>
                            <NavElement
                                tabIndex={0}
                                size={NavElementSize.Small}
                                type={NavElementType.Button}
                                startIcon={<FilterButton />}
                                className="ml-2 flex items-center self-center whitespace-nowrap"
                                aria-label={t('ariaLabel.openRefineResultsButton') as string}
                                onClick={openRefineResultsSidesheet}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        openRefineResultsSidesheet();
                                    }
                                }}
                            >
                                {t('caseManagementDashboard.refineResults')}
                            </NavElement>
                        </div>

                        <div className="w-54 sm:mt-4 md:mt-0">
                            <SelectSimple
                                size={FieldSize.Small}
                                value={caseManagementFilters.sortDirection}
                                options={[
                                    { label: t('caseManagementDashboard.sortOptions.newest'), value: 'desc' },
                                    { label: t('caseManagementDashboard.sortOptions.oldest'), value: 'asc' },
                                ]}
                                onChange={value => {
                                    setCaseManagementFilters(prevFilters => ({
                                        ...prevFilters,
                                        sortDirection: value as 'asc' | 'desc',
                                        offset: 0,
                                    }));
                                }}
                            />
                        </div>
                    </div>
                    <ActiveFilters
                        authorizedCarriers={authorizedCarriers}
                        filters={caseManagementFilters.additionalFilters}
                        removeFilter={removeAdditionalFilter}
                        onReset={resetAllFilters}
                    />
                    <StatusFilter
                        caseTotals={caseTotals}
                        values={caseManagementFilters.additionalFilters.caseStatus}
                        onChange={vals =>
                            setCaseManagementFilters(prev => {
                                const { caseStatus, notInCaseStatus = [] } = prev.additionalFilters;
                                const nonConflictingNicsVals = notInCaseStatus.filter(val => !vals.includes(val)); // remove any values that are both in caseStatus and notInCaseStatus
                                return {
                                    ...prev,
                                    additionalFilters: {
                                        ...prev.additionalFilters,
                                        caseStatus: vals,
                                        notInCaseStatus: nonConflictingNicsVals,
                                    },
                                };
                            })
                        }
                    />
                    <div ref={topDiv} className="w-full xs:overflow-x-auto xs:overflow-y-hidden xs:p-1 lg:mb-0 lg:p-0">
                        <div className="w-[1130px]" />
                    </div>
                    <div ref={bottomDiv} className="w-full xs:overflow-x-auto xs:overflow-y-hidden xs:p-1 lg:p-0">
                        {tableContent}
                    </div>
                    <div className="align-center mx-auto mt-4 grid grid-cols-4 lg:grid-cols-12 lg:pb-[120px]">
                        <div className="order-2 col-span-4 mt-8 flex items-center justify-center gap-1 pb-[120px] lg:order-1 lg:col-span-2 lg:mt-0 lg:pb-0">
                            {pageSizeDropdown}
                        </div>
                        <div className="order-1 col-span-4 lg:order-2 lg:col-span-8">{paginationControls}</div>
                    </div>
                </div>
            </NoNavLayout>
        </CaseManagementFiltersContext.Provider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const auth: Session = (await getSession(context.req, context.res)) as Session;

        const doesUserHasPagePermissions = await doesUserHavePagePermissions(
            auth?.accessToken,
            user,
            UserPermission.AllowReadCaseManagement
        );

        // DEPU-2835 - temporary work around for Advisor Excel
        const isAdvisorsExcel = await checkTupleSsr(`${auth.accessToken}`, user.partyId, FgaRelation.Party, AE_FGA_ROLE);

        if (!isAdvisorsExcel && !doesUserHasPagePermissions) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const { locale = DEFAULT_LOCALE } = context;

        const translations = await serverSideTranslations(
            locale,
            [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
            nextI18nextConfig,
            ALL_LOCALES
        );

        const authorizedCarriers = await getCarrierListServerSSR(
            `${auth?.accessToken}`,
            user.partyId,
            UserPermission.AllowReadCaseManagement
        );

        return { props: { authorizedCarriers, isAdvisorsExcel, user, locale, ...translations } };
    },
});

export default CaseManagementDashboard;
