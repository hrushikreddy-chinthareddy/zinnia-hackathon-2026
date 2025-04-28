import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useState } from 'react';

import FilterButton from '@deps/components/filter-button/filter-button';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
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
} from '@deps/contexts/CaseManagementFilters';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getAdvisorsExcelCaseParams } from '@deps/helpers/advisors-excel';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { formatCaseTotals, getAdditionalFilters, getSearchValueObject, toggleLabels } from '@deps/helpers/case-management';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { storage } from '@deps/helpers/sessionStorage.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Statuses } from '@deps/models/case/case';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import { CaseStatsQuery } from '@deps/queries/cases';
import { getCaseSearchQuery, postCaseStatsQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { FgaRelation } from '@deps/types/fga';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import { SearchSubmittedEvent, SegmentPageName, SegmentTrackedEventName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import useCaseFilterQueryStore from './caseFilterQueryStore';
import styles from './index.module.css';

// Lazy Loaded Components
const SideSheetRefineResults = dynamic(() => import('@deps/components/side-sheet/side-sheet-refine-results/side-sheet-refine-results'));
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
    const { featureFlags } = useOptimizely();
    const enableAdditionalAdvisorsExcelCarriers = featureFlags?.case_advisors_excel_additional_carrier_support;

    useSegmentPageTracker(user, SegmentPageName.CaseManagementDashboard);

    // Data Fetcher(s)
    const caseStatsRequestObject = useMemo(() => {
        // We don't want to use the status filters when getting counts for the search results
        const { caseStatus, notInCaseStatus, ...additionalFilters } = getAdditionalFilters(caseManagementFilters.additionalFilters);

        const searchValueObject = getSearchValueObject(caseManagementFilters.searchValue, caseManagementFilters.toggleValue);

        let caseStatsRequest: CaseStatsQuery = {
            ...additionalFilters,
            ...searchValueObject,
            groupBy: ['caseStatus'],
        };

        if (isAdvisorsExcel) {
            const advisorsExcelParams = getAdvisorsExcelCaseParams(enableAdditionalAdvisorsExcelCarriers);

            caseStatsRequest = {
                ...caseStatsRequest,
                ...advisorsExcelParams,
            };
        }
        return caseStatsRequest;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        caseManagementFilters.additionalFilters,
        caseManagementFilters.searchValue,
        isAdvisorsExcel,
        enableAdditionalAdvisorsExcelCarriers,
    ]);

    const { data: caseTotals } = useQuery({
        queryKey: ['caseStats', caseStatsRequestObject],
        queryFn: () => postCaseStatsQuery(caseStatsRequestObject),
        placeholderData: {
            All: 0,
            [Statuses.InProgress]: 0,
            [Statuses.Exception]: 0,
            [Statuses.NotStarted]: 0,
            [Statuses.Completed]: 0,
            [Statuses.Canceled]: 0,
        },
        enabled: loadedStoredFilters,
        select: result => formatCaseTotals(result.count, result.stats[0]),
    });

    const searchValueObject = useMemo(() => {
        const svo = getSearchValueObject(caseManagementFilters.searchValue, caseManagementFilters.toggleValue);
        let additionalFilters = getAdditionalFilters(caseManagementFilters.additionalFilters);
        if (isAdvisorsExcel) {
            const advisorsExcelParams = getAdvisorsExcelCaseParams(enableAdditionalAdvisorsExcelCarriers);
            additionalFilters = { ...additionalFilters, ...advisorsExcelParams };
        }
        return {
            ...svo,
            ...additionalFilters,
            limit,
            offset: caseManagementFilters.offset,
            sortDirection: caseManagementFilters.sortDirection,
            sortBy: caseManagementFilters.sortBy || 'createdAt',
        };
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
        enableAdditionalAdvisorsExcelCarriers,
    ]);

    const {
        data: caseSearchData,
        isLoading: caseSearchLoading,
        isError: caseSearchError,
    } = useQuery({
        queryKey: ['cases', searchValueObject],
        queryFn: () => getCaseSearchQuery(searchValueObject),
        enabled: loadedStoredFilters,
    });

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
    }, [caseManagementFilters, handleClear, handleSearch, handleToggle]);

    const paginationControls = useMemo(() => {
        const goToPage = (pageNumber: number) => {
            setCaseManagementFilters(prevFilters => ({
                ...prevFilters,
                offset: (pageNumber - 1) * limit,
            }));

            window.scrollTo(0, 0);
        };

        return (
            <PaginationControls
                total={caseSearchData?.total || 0}
                limit={limit}
                offset={caseManagementFilters.offset}
                goToPage={goToPage}
            />
        );
    }, [caseSearchData, caseManagementFilters.offset, limit, setCaseManagementFilters]);

    const tableContent = useMemo(() => {
        if (caseSearchLoading) return <PageLoader variant={PageLoaderVariant.Center} />;
        if (caseSearchError) return <SearchResultsErrorCard />;

        return (
            <>
                <CaseResultTable
                    cases={caseSearchData?.data ?? []}
                    searchValues={caseManagementFilters.searchValue}
                    handleSort={handleCreatedBySort}
                    sortDirection={caseManagementFilters.sortDirection}
                />

                <div className="flex flex-col items-center lg:grid lg:grid-cols-3 mt-3">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={`mb-6 lg:mb-0 ${(caseSearchData?.total || 0) < 1 ? 'hidden' : ''}`}
                    >
                        {t('policy.documents.xToYOfZ', {
                            x: caseManagementFilters.offset + 1,
                            y: Math.min(caseManagementFilters.offset + limit, caseSearchData?.total || 0),
                            z: `${caseSearchData?.total?.toLocaleString() ?? '0'}${caseSearchData?.total === 10000 ? '+' : ''}`,
                        })}
                    </Typography>
                    {paginationControls}
                </div>
            </>
        );
    }, [
        caseSearchData,
        caseSearchLoading,
        caseSearchError,
        caseManagementFilters.offset,
        caseManagementFilters.searchValue,
        caseManagementFilters.sortDirection,
        handleCreatedBySort,
        paginationControls,
        t,
    ]);

    // Sidesheet Support
    const sideSheet = useSideSheetContext();
    const openRefineResultsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            t('caseManagementDashboard.addFilters') as string,
            <SideSheetRefineResults
                authorizedCarriers={authorizedCarriers}
                filters={caseManagementFilters.additionalFilters}
                setCaseManagementFilters={setCaseManagementFilters}
                closeSideSheet={() => sideSheet.handleOpen(false)}
            />
        );
        sideSheet.handleOpen(true);
    };

    dayjs.extend(isBetween);

    // JSX
    return (
        <CaseManagementFiltersContext.Provider value={[caseManagementFilters, setCaseManagementFilters]}>
            <PageHead titleKey="caseManagement" />
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
                        {t('caseManagementDashboard.addFilters')}
                    </NavElement>
                    <ActiveFilters
                        authorizedCarriers={authorizedCarriers}
                        filters={caseManagementFilters.additionalFilters}
                        removeFilter={removeAdditionalFilter}
                        onReset={resetAllFilters}
                    />
                </div>
                {tableContent}
            </div>
        </CaseManagementFiltersContext.Provider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);

            const doesUserHasPagePermissions = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadCaseManagement,
                loggingContext
            );

            // DEPU-2835
            const isAdvisorsExcel = await checkTuplePage(context, FgaRelation.Party, AE_FGA_ROLE, loggingContext);

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

            const authorizedCarriers = await listCarriersPage(context, UserPermission.AllowReadCaseManagement, loggingContext);

            return { props: { authorizedCarriers, isAdvisorsExcel, user, locale, ...translations } };
        },
    },
    { file: 'cases/index', function: 'getServerSideProps', page: 'cases' }
);

export default CaseManagementDashboard;
