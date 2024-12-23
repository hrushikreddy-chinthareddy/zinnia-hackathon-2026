import { Session, getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useState } from 'react';

import FilterButton from '@deps/components/filter-button/filter-button';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import NoNavLayout from '@deps/components/no-nav-layout';
import { PageLoader, PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import SearchBar, { SearchBarInitialValues } from '@deps/components/search/search-bar';
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
    CaseTableData,
} from '@deps/contexts/CaseManagementFilters';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getAdvisorsExcelCaseSearchParams, getAdvisorsExcelCaseStatsParams } from '@deps/helpers/advisors-excel';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { formatCaseTotals, getAdditionalFilters, getSearchValueObject, toggleLabels } from '@deps/helpers/case-management';
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
import { SearchSubmittedEvent, SegmentPageName, SegmentTrackedEventName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import nextI18nextConfig from 'next-i18next.config';

import useCaseFilterQueryStore from './caseFilterQueryStore';
import styles from './index.module.css';

// Lazy Loaded Components
const SideSheetRefineResults = dynamic(() => import('@deps/containers/side-sheet-refine-results/side-sheet-refine-results'));
const ActiveFilters = dynamic(() => import('@deps/containers/active-filters/active-filters'));
const SearchResultsErrorCard = dynamic(() => import('@deps/containers/search-results/search-results-error-card/search-results-error-card'));
const PaginationControls = dynamic(() => import('@deps/components/pagination/pagination'));

interface CaseManagementDashboardProps extends SegmentTrackedPageProps {
    authorizedCarriers: string[];
    isAdvisorsExcel: boolean;
}

const CaseManagementDashboard = ({ authorizedCarriers, isAdvisorsExcel, user }: CaseManagementDashboardProps) => {
    const [caseManagementFilters, setCaseManagementFilters] = useCaseFilterQueryStore();
    const limit = 25;
    const [loadedStoredFilters, setLoadedStoredFilters] = useState(false);
    const handleCreatedBySort = useCallback(() => {
        setCaseManagementFilters(prevFilters => ({
            ...prevFilters,
            sortDirection: prevFilters.sortDirection === 'asc' ? 'desc' : 'asc',
            offset: 0,
        }));
    }, [setCaseManagementFilters]);

    const { t } = useTranslation();

    useSegmentPageTracker(user, SegmentPageName.CaseManagementDashboard);

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
                const newResult = formatCaseTotals(response.count, response.stats[0]);

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
                limit: limit,
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // for caseManagementFilters.toggleValue,
        caseManagementFilters.searchValue,
        caseManagementFilters.additionalFilters,
        caseManagementFilters.offset,
        limit,
        caseManagementFilters.sortDirection,
        caseManagementFilters.sortBy,
        isAdvisorsExcel,
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
                    brokerDealerName: caseManagementFilters.additionalFilters.brokerDealerName,
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
        // for caseManagementFilters
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleSearch = useCallback(
        (value: SearchViewQuery) => {
            segmentAnalyticsTrackEvent<SearchSubmittedEvent>(SegmentTrackedEventName.SearchSubmitted, {
                agentName: !!value?.agentFirstName || !!value?.agentLastName,
                caseID: value?.caseId,
                firmName: value?.firmName,
                ssnUsed: !!value?.ssn,
                firstNameUsed: !!value?.ownerFirstName,
                lastNameUsed: !!value?.ownerLastName,
                policyNumber: value?.policyNumber,
                session_id: user.sid,
                userId: user.partyId,
            });
            setCaseManagementFilters(prevFilters => ({ ...prevFilters, searchValue: value, offset: 0 }));
        },
        [setCaseManagementFilters]
    );

    const handleClear = useCallback(
        (searchField: PolicySearchKeys | undefined) => {
            if (searchField) {
                const prevSearch = caseManagementFilters.searchValue;
                delete prevSearch?.[searchField];
                setCaseManagementFilters(prevFilters => ({
                    ...prevFilters,
                    searchValue: { ...prevSearch },
                    offset: 0,
                }));
            }
        },
        [caseManagementFilters.searchValue, setCaseManagementFilters]
    );

    const handleToggle = useCallback(
        (value: PolicySearchKeys) =>
            setCaseManagementFilters(prevFilters => ({ ...prevFilters, searchValue: SearchBarInitialValues, toggleValue: value })),
        [setCaseManagementFilters]
    );

    // Memoized Component(s)
    const searchBar = useMemo(() => {
        return (
            <SearchBar
                searchValue={caseManagementFilters.searchValue}
                onSearch={handleSearch}
                toggleLabels={toggleLabels}
                initialToggleValue={caseManagementFilters.toggleValue}
                onToggle={handleToggle}
                onClear={handleClear}
            />
        );
    }, [caseManagementFilters.searchValue, caseManagementFilters.toggleValue, handleClear, handleSearch, handleToggle]);

    const paginationControls = useMemo(() => {
        const goToPage = (pageNumber: number) => {
            setCaseManagementFilters(prevFilters => ({
                ...prevFilters,
                offset: (pageNumber - 1) * limit,
            }));

            window.scrollTo(0, 0);
        };

        return <PaginationControls total={caseTableData.total} limit={limit} offset={caseManagementFilters.offset} goToPage={goToPage} />;
    }, [caseTableData.total, caseManagementFilters.offset, limit, setCaseManagementFilters]);

    const tableContent = useMemo(() => {
        const { cases, loading, error } = caseTableData;

        if (loading) return <PageLoader variant={PageLoaderVariant.Center} />;
        if (error) return <SearchResultsErrorCard />;

        return (
            <>
                <CaseResultTable
                    cases={cases}
                    searchValues={caseManagementFilters.searchValue}
                    handleSort={handleCreatedBySort}
                    sortDirection={caseManagementFilters.sortDirection}
                />
            </>
        );
    }, [caseTableData, caseManagementFilters.searchValue, caseManagementFilters.sortDirection, handleCreatedBySort]);

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
                <Typography variant={TypographyVariant.H1} className="md:mb-8 mb-4">
                    {t('caseManagementDashboard.h1')}
                </Typography>
                <div className={styles.container}>
                    {searchBar}
                    <div className="sm:my-4 mt-4 mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <StatusFilter
                            caseTotals={caseTotals}
                            onChange={vals =>
                                setCaseManagementFilters(prev => {
                                    const { notInCaseStatus = [] } = prev.additionalFilters;
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
                            sessionId={user.sid}
                            userId={user.partyId}
                            values={caseManagementFilters.additionalFilters.caseStatus}
                        />
                        <NavElement
                            tabIndex={0}
                            size={NavElementSize.Small}
                            type={NavElementType.Button}
                            startIcon={<FilterButton />}
                            className="flex items-center whitespace-nowrap"
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
                        <ActiveFilters
                            authorizedCarriers={authorizedCarriers}
                            filters={caseManagementFilters.additionalFilters}
                            removeFilter={removeAdditionalFilter}
                            onReset={resetAllFilters}
                        />
                    </div>
                    {tableContent}
                    <div className="flex flex-col items-center lg:grid lg:grid-cols-3 mt-3">
                        <Typography variant={TypographyVariant.BodySm} className="mb-6 lg:mb-0">
                            {t('policy.documents.xToYOfZ', {
                                x: caseManagementFilters.offset + 1,
                                y: Math.min(caseManagementFilters.offset + limit, caseTableData.total),
                                z: `${caseTableData.total.toLocaleString()}${caseTableData.total === 10000 ? '+' : ''}`,
                            })}
                        </Typography>
                        {paginationControls}
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
