import { useQuery } from '@tanstack/react-query';
import { FgaRoles } from '@xd/utils/dist';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
    KeyboardEvent,
    useCallback,
    useMemo,
    useState,
    useEffect,
} from 'react';

import FilterButton from '@deps/components/filter-button/filter-button';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import {
    PageLoader,
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import SearchBar from '@deps/components/search/search-bar';
import { CaseResultTable } from '@deps/components/table/case-result-table';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
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
import {
    formatCaseTotals,
    getAdditionalFilters,
    getSearchValueObject,
    toggleLabels,
} from '@deps/helpers/case-management';
import { isEmptyObject } from '@deps/helpers/objects.helpers';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { storage } from '@deps/helpers/sessionStorage.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Statuses } from '@deps/models/case/case';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import { CaseStatsQuery } from '@deps/queries/cases';
import {
    getCaseSearchQuery,
    postCaseStatsQuery,
} from '@deps/queries/tanstack/caseQueries/caseQueries';
import { FgaRelation } from '@deps/types/fga';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import {
    SearchSubmittedEvent,
    SegmentPageName,
    SegmentTrackedEventName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import useCaseFilterQueryStore from './caseFilterQueryStore';

// Lazy Loaded Components
const SideSheetRefineResults = dynamic(
    () =>
        import(
            '@deps/components/side-sheet/side-sheet-refine-results/side-sheet-refine-results'
        )
);
const ActiveFilters = dynamic(
    () => import('@deps/containers/active-filters/active-filters')
);
const SearchResultsErrorCard = dynamic(
    () =>
        import(
            '@deps/containers/search-results/search-results-error-card/search-results-error-card'
        )
);
const PaginationControls = dynamic(
    () => import('@deps/components/pagination/pagination')
);

// extend dayjs with isBetween plugin outside of the component to avoid re-initializing it on every render
dayjs.extend(isBetween);

interface CaseManagementDashboardProps extends SegmentTrackedPageProps {
    authorizedCarriers: string[];
    isAdvisorsExcel: boolean;
}

const CaseManagementDashboard = ({
    authorizedCarriers,
    isAdvisorsExcel,
    user,
}: CaseManagementDashboardProps) => {
    const [
        caseManagementFilters,
        setCaseManagementFilters,
        currentSearchValue,
        setCurrentSearchValue,
    ] = useCaseFilterQueryStore();

    const limit = 25;
    const [loadedStoredFilters, setLoadedStoredFilters] = useState(false);

    const handleCreatedBySort = useCallback(
        (key: 'createdAt') => {
            setCaseManagementFilters((prevFilters) => {
                const sameColumn = prevFilters.sortBy === key;

                return {
                    ...prevFilters,
                    searchValue: currentSearchValue,
                    sortBy: key,
                    sortDirection:
                        sameColumn && prevFilters.sortDirection === 'asc'
                            ? 'desc'
                            : 'asc',
                    offset: 0,
                };
            });
        },
        [currentSearchValue, setCaseManagementFilters]
    );

    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const enableAdditionalAdvisorsExcelCarriers =
        featureFlags?.case_advisors_excel_additional_carrier_support;

    useSegmentPageTracker(user, SegmentPageName.CaseManagementDashboard);

    // Data Fetcher(s)
    const caseStatsRequestObject = useMemo(() => {
        // We don't want to use the status filters when getting counts for the search results
        const { caseStatus, notInCaseStatus, ...additionalFilters } =
            getAdditionalFilters(caseManagementFilters.additionalFilters);

        const searchValueObject = getSearchValueObject(
            caseManagementFilters.searchValue,
            caseManagementFilters.toggleValue
        );

        let caseStatsRequest: CaseStatsQuery = {
            ...additionalFilters,
            ...searchValueObject,
            groupBy: ['caseStatus'],
        };

        if (isAdvisorsExcel) {
            const advisorsExcelParams = getAdvisorsExcelCaseParams(
                enableAdditionalAdvisorsExcelCarriers
            );

            caseStatsRequest = {
                ...caseStatsRequest,
                ...advisorsExcelParams,
            };
        }
        return caseStatsRequest;
    }, [
        caseManagementFilters.additionalFilters,
        caseManagementFilters.searchValue,
        caseManagementFilters.toggleValue,
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
        select: (result) => formatCaseTotals(result.count, result.stats[0]),
    });

    const searchValueObject = useMemo(() => {
        const svo = getSearchValueObject(
            caseManagementFilters.searchValue,
            caseManagementFilters.toggleValue
        );
        let additionalFilters = getAdditionalFilters(
            caseManagementFilters.additionalFilters
        );

        if (isAdvisorsExcel) {
            const advisorsExcelParams = getAdvisorsExcelCaseParams(
                enableAdditionalAdvisorsExcelCarriers
            );
            additionalFilters = {
                ...additionalFilters,
                ...advisorsExcelParams,
            };
        }

        return {
            ...svo,
            ...additionalFilters,
            limit,
            offset: caseManagementFilters.offset,
            sortDirection: caseManagementFilters.sortDirection,
            sortBy: caseManagementFilters.sortBy || 'createdAt',
        };
    }, [
        caseManagementFilters.searchValue,
        caseManagementFilters.toggleValue,
        caseManagementFilters.additionalFilters,
        caseManagementFilters.offset,
        caseManagementFilters.sortDirection,
        caseManagementFilters.sortBy,
    ]);

    const {
        data: caseSearchData,
        isLoading: caseSearchLoading,
        isError: caseSearchError,
    } = useQuery({
        queryKey: ['cases', searchValueObject, featureFlags],
        queryFn: () => getCaseSearchQuery(searchValueObject, featureFlags),
        enabled: loadedStoredFilters,
    });

    const liveResultsMessage = useMemo(() => {
        if (caseSearchData?.data.length) {
            return t('policy.documents.xToYOfZ', {
                x: caseManagementFilters.offset + 1,
                y: Math.min(
                    caseManagementFilters.offset + limit,
                    caseSearchData.total || 0
                ),
                z: `${caseSearchData.total?.toLocaleString() ?? '0'}${
                    caseSearchData.total === 10000 ? '+' : ''
                }`,
            });
        } else {
            return !isEmptyObject(caseManagementFilters.searchValue)
                ? t('caseManagementDashboard.search.empty.title')
                : t('caseManagementDashboard.search.empty.titleFilters');
        }
    }, [
        caseSearchData,
        caseManagementFilters.offset,
        limit,
        t,
        caseManagementFilters.searchValue,
    ]);

    useEffect(() => {
        if (loadedStoredFilters) {
            storage.setItem('CASE_MANAGEMENT_FILTERS', {
                ...caseManagementFilters,
                additionalFilters: {
                    ...caseManagementFilters.additionalFilters,
                    processTypes: Array.from(
                        caseManagementFilters.additionalFilters.processTypes
                    ),
                    products: Array.from(
                        caseManagementFilters.additionalFilters.products
                    ),
                    brokerDealerName:
                        caseManagementFilters.additionalFilters
                            .brokerDealerName,
                    requestSubType: Array.from(
                        caseManagementFilters.additionalFilters.requestSubType
                    ),
                },
            });
        }
    }, [caseManagementFilters, loadedStoredFilters]);

    useEffect(() => {
        const filtersFromStorage = storage.getItem(
            'CASE_MANAGEMENT_FILTERS'
        ) as CaseSearchFilters;
        if (filtersFromStorage) {
            const processTypesFromStorage =
                typeof filtersFromStorage?.additionalFilters?.processTypes?.[
                    Symbol.iterator
                ] === 'function'
                    ? filtersFromStorage.additionalFilters.processTypes
                    : [];
            filtersFromStorage.additionalFilters.processTypes = new Set(
                processTypesFromStorage
            );

            // Original products were an empty object.  Checking to make sure type is iterable before creating a set from them
            const productFromStorage =
                typeof filtersFromStorage?.additionalFilters?.products?.[
                    Symbol.iterator
                ] === 'function'
                    ? filtersFromStorage.additionalFilters.products
                    : [];
            filtersFromStorage.additionalFilters.products = new Set(
                productFromStorage
            );
            // Original products were an empty object.  Checking to make sure type is iterable before creating a set from them
            const requestSubTypeFromStorage =
                typeof filtersFromStorage?.additionalFilters?.requestSubType?.[
                    Symbol.iterator
                ] === 'function'
                    ? filtersFromStorage.additionalFilters.requestSubType
                    : [];
            filtersFromStorage.additionalFilters.requestSubType = new Set(
                requestSubTypeFromStorage
            );
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
        setCaseManagementFilters((prevFilters) => ({
            ...prevFilters,
            searchValue: currentSearchValue,
            additionalFilters: filters,
            offset: 0,
        }));

    const handleSearch = useCallback(
        (value: SearchViewQuery) => {
            segmentAnalyticsTrackEvent<SearchSubmittedEvent>(
                SegmentTrackedEventName.SearchSubmitted,
                {
                    agentName:
                        !!value?.agentFirstName || !!value?.agentLastName,
                    caseID: value?.caseId,
                    firmName: value?.firmName,
                    ssnUsed: !!value?.ssn,
                    firstNameUsed: !!value?.ownerFirstName,
                    lastNameUsed: !!value?.ownerLastName,
                    policyNumber: value?.policyNumber,
                    authSessionId: user.sid,
                    userId: user.partyId,
                }
            );
            setCaseManagementFilters((prevFilters) => ({
                ...prevFilters,
                searchValue: value,
                offset: 0,
            }));
        },
        [setCaseManagementFilters, user.sid, user.partyId]
    );

    const handleClear = useCallback(
        (searchField: PolicySearchKeys | undefined) => {
            if (searchField) {
                const prevSearch = caseManagementFilters.searchValue;
                delete prevSearch?.[searchField];
                setCaseManagementFilters((prevFilters) => ({
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
            setCaseManagementFilters((prevFilters) => ({
                ...prevFilters,
                toggleValue: value,
            })),
        [setCaseManagementFilters]
    );

    const handleSearchInputChange = (value: string, key: PolicySearchKeys) => {
        setCurrentSearchValue((prevSearch) => ({
            ...prevSearch,
            [key]: value,
        }));
    };

    const paginationControls = useMemo(() => {
        const goToPage = (pageNumber: number) => {
            setCaseManagementFilters((prevFilters) => ({
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
    }, [
        caseSearchData,
        caseManagementFilters.offset,
        limit,
        setCaseManagementFilters,
    ]);

    const tableContent = useMemo(() => {
        if (caseSearchLoading)
            return <PageLoader variant={PageLoaderVariant.Center} />;
        if (caseSearchError) return <SearchResultsErrorCard />;

        const numberOfItems = caseManagementFilters.offset + 1;
        const currentIndex = Math.min(
            caseManagementFilters.offset + limit,
            caseSearchData?.total || 0
        );
        const total = `${caseSearchData?.total?.toLocaleString() ?? '0'}${
            caseSearchData?.total === 10000 ? '+' : ''
        }`;

        return (
            <>
                <CaseResultTable
                    cases={caseSearchData?.data ?? []}
                    searchValues={caseManagementFilters.searchValue}
                    handleSort={handleCreatedBySort}
                    sortDirection={caseManagementFilters.sortDirection}
                    sortBy={caseManagementFilters.sortBy}
                />
                <div className="flex flex-col items-center lg:grid lg:grid-cols-3 mt-3">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={`mb-6 lg:mb-0`}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {caseSearchData
                            ? t('policy.documents.xToYOfZ', {
                                  x: numberOfItems,
                                  y: currentIndex,
                                  z: total,
                              })
                            : ''}
                    </Typography>
                    {paginationControls}
                </div>
            </>
        );
    }, [
        caseSearchLoading,
        caseSearchError,
        caseManagementFilters.offset,
        caseManagementFilters.searchValue,
        caseManagementFilters.sortDirection,
        caseManagementFilters.sortBy,
        caseSearchData,
        handleCreatedBySort,
        t,
        paginationControls,
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
                currentSearchValue={currentSearchValue}
                closeSideSheet={() => sideSheet.handleOpen(false)}
            />
        );
        sideSheet.handleOpen(true);
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            openRefineResultsSidesheet();
        }
    };

    // JSX
    return (
        <CaseManagementFiltersContext.Provider
            value={[
                caseManagementFilters,
                setCaseManagementFilters,
                currentSearchValue,
                setCurrentSearchValue,
            ]}
        >
            <PageHead titleKey="caseManagement" />
            <Typography variant={TypographyVariant.H1} className="mb-4">
                {t('caseManagementDashboard.h1')}
            </Typography>
            <>
                <SearchBar
                    searchValue={caseManagementFilters.searchValue}
                    onSearch={handleSearch}
                    toggleLabels={toggleLabels}
                    initialToggleValue={caseManagementFilters.toggleValue}
                    onToggle={handleToggle}
                    onClear={handleClear}
                    onChangeCallback={handleSearchInputChange}
                />
                <fieldset form="search-form">
                    <legend>
                        <label
                            htmlFor="status-select"
                            className="typography-labels-field-label mt-4 mb-1"
                        >
                            {t('caseOverview.tasks.status')}
                        </label>
                    </legend>
                    <div className="sm:my-4 mt-4 mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <StatusFilter
                            caseTotals={caseTotals}
                            onChange={(vals) =>
                                setCaseManagementFilters((prev) => {
                                    const { notInCaseStatus = [] } =
                                        prev.additionalFilters;
                                    const nonConflictingNicsVals =
                                        notInCaseStatus.filter(
                                            (val) => !vals.includes(val)
                                        ); // remove any values that are both in caseStatus and notInCaseStatus
                                    return {
                                        ...prev,
                                        offset: 0,
                                        searchValue: {
                                            // set this to the current search value in the input field
                                            ...currentSearchValue,
                                        },
                                        additionalFilters: {
                                            ...prev.additionalFilters,
                                            caseStatus: vals,
                                            notInCaseStatus:
                                                nonConflictingNicsVals,
                                        },
                                    };
                                })
                            }
                            sessionId={user.sid}
                            userId={user.partyId}
                            values={
                                caseManagementFilters.additionalFilters
                                    .caseStatus
                            }
                        />
                        <NavElement
                            tabIndex={0}
                            size={NavElementSize.Small}
                            type={NavElementType.Button}
                            startIcon={<FilterButton />}
                            className="flex items-center whitespace-nowrap"
                            aria-label={
                                t('ariaLabel.openRefineResultsButton') as string
                            }
                            onClick={openRefineResultsSidesheet}
                            onKeyDown={handleKeyDown}
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
                </fieldset>
                <div aria-live="polite" aria-atomic="true" className="sr-only">
                    {liveResultsMessage}
                </div>
                {tableContent}
            </>
        </CaseManagementFiltersContext.Provider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            const doesUserHasPagePermissions = featureFlagDecisions?.[
                FEATURE_FLAGS.ENTERPRISE_SEARCH_CASE
            ]
                ? await checkTuplePage(
                      context,
                      FgaRelation.UiAccess,
                      FgaRoles.CASE_MANAGEMENT_ZL_ENTITY,
                      loggingContext
                  )
                : await doesUserHavePagePermissions(
                      context,
                      UserPermission.AllowReadCaseManagement,
                      loggingContext
                  );

            // DEPU-2835
            const isAdvisorsExcel = await checkTuplePage(
                context,
                FgaRelation.Party,
                AE_FGA_ROLE,
                loggingContext
            );

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

            const authorizedCarriers = await listCarriersPage(
                context,
                UserPermission.AllowReadCaseManagement,
                loggingContext
            );

            return {
                props: {
                    authorizedCarriers,
                    isAdvisorsExcel,
                    user,
                    locale,
                    ...translations,
                },
            };
        },
    },
    { file: 'cases/index', function: 'getServerSideProps', page: 'cases' }
);

export default CaseManagementDashboard;
