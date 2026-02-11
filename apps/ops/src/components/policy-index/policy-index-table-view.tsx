import { useQuery } from '@tanstack/react-query';
import { NextRouter, useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { createContext, useContext, useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import SearchBar, {
    SearchBarInitialValues,
} from '@deps/components/search/search-bar';
import { PolicySearchResultsTable } from '@deps/containers/policy-search-results-table/policy-search-results-table';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import {
    PolicySearchFilters,
    PolicySearchFiltersContext,
} from '@deps/contexts/PolicySearchFilters';
import { useSearchBarcontext } from '@deps/contexts/SearchBarContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import {
    SortOrder,
    useTableOptions,
} from '@deps/hooks/dashboard/useTableOptions';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { getPoliciesQuery } from '@deps/queries/tanstack/policyQueries/policyQueries';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import {
    SearchSubmittedEvent,
    SegmentPageName,
    SegmentTrackedEventName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import styles from './policy-index-table-view.module.css';
import { PolicySortBy } from './types';
import { BlurOverlayLoader } from '../overlay-loader/overlay-loader';
import PaginationControls from '../pagination/pagination';
import Typography, { TypographyVariant } from '../typography/typography';

const toggleLabels =
    (featureFlags: FeatureFlags) =>
    (t: TFunction): LabelValue<PolicySearchKeys>[] =>
        [
            {
                label: t('dashboard.search.buttons.policyNumber'),
                value: 'policyNumber',
                placeholder: '',
                errorMessage: t('allFields.policyNumberSearchError') ?? '',
            },
            {
                label: t('dashboard.search.buttons.ssn'),
                value: 'ssn',
                fullLabel: t('dashboard.search.buttons.ssnFullLabel') ?? '',
                placeholder: t('dashboard.search.buttons.ssnPlaceholder') ?? '',
                format: '###-##-####',
                replaceValue: '-',
                errorMessage: t('allFields.ssnSearchError') ?? '',
            },
            {
                label: t('dashboard.search.buttons.name'),
                value: 'firstName',
                ...(featureFlags.enterprise_search_trust_or_organization
                    ? {
                          group: [
                              {
                                  label: t(
                                      'dashboard.search.buttons.firstName'
                                  ),
                                  value: 'firstName',
                                  placeholder: '',
                                  errorMessage:
                                      t('allFields.firstNameSearchError') ?? '',
                              },
                              {
                                  label: t('dashboard.search.buttons.lastName'),
                                  value: 'lastName',
                                  placeholder: '',
                                  errorMessage:
                                      t('allFields.lastNameSearchError') ?? '',
                              },
                              {
                                  label: t('dashboard.search.buttons.fullName'),
                                  value: 'fullName',
                                  placeholder: 'Trust or organization',
                                  errorMessage:
                                      t('allFields.fullNameSearchError') ?? '',
                              },
                          ],
                      }
                    : {
                          group: [
                              {
                                  label: t(
                                      'dashboard.search.buttons.firstName'
                                  ),
                                  value: 'firstName',
                                  placeholder: '',
                                  errorMessage:
                                      t('allFields.firstNameSearchError') ?? '',
                              },
                              {
                                  label: t('dashboard.search.buttons.lastName'),
                                  value: 'lastName',
                                  placeholder: '',
                                  errorMessage:
                                      t('allFields.lastNameSearchError') ?? '',
                              },
                          ],
                      }),
            },
        ];

export interface DashboardContextProps {
    searchValue: SearchViewQuery;
}

export const DashboardContext = createContext<DashboardContextProps>({
    searchValue: SearchBarInitialValues,
});

interface PolicyManagementDashboardProps extends SegmentTrackedPageProps {}

export const PolicyIndexTableView = ({
    user,
}: PolicyManagementDashboardProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    useSegmentPageTracker(user, SegmentPageName.PolicyManagementDashboard);

    const {
        policySearchFilters,
        setPolicySearchFilters,
        clearPolicySearchFilters,
    } = useContext(PolicySearchFiltersContext);

    const { setShowFieldErrorMessage, validateValueToSearch } =
        useSearchBarcontext();

    const { searchValue, offset } = policySearchFilters;

    const limit = 10;

    const { featureFlags } = useOptimizely();

    const goToPage = (pageNumber: number) => {
        setPolicySearchFilters({
            ...policySearchFilters,
            offset: (pageNumber - 1) * limit,
        });
        window.scrollTo(0, 0);
    };

    const { handleSort, sortBy, sortOrder } = useTableOptions<{
        [key in PolicySortBy]: Record<string, string>;
    }>({
        sortByDefault: PolicySortBy.LAST_UPDATED,
        defaultSortOrder: SortOrder.DESC,
    });

    const {
        data: policyData,
        isFetching: isPolicyDataFetching,
        isError: policyDataError,
    } = useQuery({
        queryKey: [
            'searchPolicyData',
            searchValue,
            limit,
            offset,
            sortBy,
            sortOrder,
        ],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getPoliciesQuery(searchValue, limit, offset, sortOrder, sortBy),
    });

    const isSetSearchFromUrl = (
        policyNumber: string | string[] | undefined
    ): boolean => {
        return (
            !!policyNumber &&
            (!policySearchFilters?.searchValue?.policyNumber ||
                policySearchFilters?.searchValue?.policyNumber !== policyNumber)
        );
    };

    useEffect(() => {
        return () => setShowFieldErrorMessage(false);
    }, [setShowFieldErrorMessage]);

    //TODO: Can we completely refactor how the search context works?
    // I feel like we could potentially move it out of state and make the search completely URL driven
    // The search button would just set the URL params, the trick is seeing if that can update the API request without triggering a full page load
    useEffect(() => {
        const { policyNumber = '' } = router.query;

        if (isSetSearchFromUrl(policyNumber)) {
            const newSearchValue = {
                ...policySearchFilters.searchValue,
                policyNumber: policyNumber as string,
            };
            setPolicySearchFilters({
                ...policySearchFilters,
                searchValue: newSearchValue,
            });
        } else if (
            !policyNumber &&
            policySearchFilters.searchValue?.policyNumber
        ) {
            // clear policyNumber from searchValue when URL param is removed
            const newSearchValue = { ...policySearchFilters.searchValue };
            delete newSearchValue.policyNumber;

            setPolicySearchFilters({
                ...policySearchFilters,
                searchValue: newSearchValue,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query?.policyNumber]);

    const removePolicyNumberFromQuery = async (router: NextRouter) => {
        try {
            if (router.query.policyNumber) {
                const { policyNumber, ...rest } = router.query;
                await router.replace(
                    { pathname: router.pathname, query: rest },
                    undefined,
                    { shallow: true }
                );
            }
        } catch (error: any) {
            browserLogError('Failed to remove policyNumber from query:', error);
        }
    };

    // Handlers
    const handleSearch = (value: SearchViewQuery) => {
        segmentAnalyticsTrackEvent<SearchSubmittedEvent>(
            SegmentTrackedEventName.SearchSubmitted,
            {
                policyNumber: value?.policyNumber,
                ssnUsed: !!value?.ssn,
                firstNameUsed: !!value?.firstName,
                lastNameUsed: !!value?.lastName,
                authSessionId: user.sid,
                userId: user.partyId,
            }
        );

        validateValueToSearch(value);

        const newSearchValues: PolicySearchFilters = {
            ...policySearchFilters,
            searchValue: value,
            offset: 0,
        };

        setPolicySearchFilters(newSearchValues);
    };

    const onToggle = (value: PolicySearchKeys) => {
        const newSearchValues: PolicySearchFilters = {
            ...policySearchFilters,
            toggleValue: value,
        };
        setPolicySearchFilters(newSearchValues);
    };

    const handleClear = async () => {
        await removePolicyNumberFromQuery(router);
        clearPolicySearchFilters();
    };

    const showPagination = !!policyData?.total && !!policyData?.results?.length;
    const hasSearchFilters =
        Object.keys(policySearchFilters.searchValue).length > 0;

    return (
        <DashboardContext.Provider
            value={{ searchValue: policySearchFilters.searchValue }}
        >
            <PageHead titleKey="policySearch" />
            <div className={styles.policySearchContainer}>
                <h1 className="typography-desktop-headline-1-d">
                    {t('dashboard.h1')}
                </h1>
                <SearchBar
                    searchValue={policySearchFilters.searchValue}
                    onSearch={handleSearch}
                    toggleLabels={toggleLabels(featureFlags)}
                    initialToggleValue={policySearchFilters.toggleValue}
                    onClear={handleClear}
                    onToggle={onToggle}
                    handleError={setShowFieldErrorMessage}
                />

                <BlurOverlayLoader loading={isPolicyDataFetching}>
                    <PolicySearchResultsTable
                        data={policyData}
                        isError={!!policyDataError}
                        handleSort={handleSort}
                        sortOrder={sortOrder}
                        isFiltered={hasSearchFilters}
                    />
                </BlurOverlayLoader>

                {/* TODO: We were using the bloom pagination and it was breaking in Edge.
                    TODO: Go and fix bloom and replace it with here. Below was copied from cases index page
                */}
                {showPagination && (
                    <div className="flex flex-col items-center lg:grid lg:grid-cols-3 mt-3">
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={`mb-6 lg:mb-0 ${
                                (policyData?.total || 0) < 1 ? 'hidden' : ''
                            }`}
                        >
                            {t('policy.documents.xToYOfZ', {
                                x: offset + 1,
                                y: Math.min(
                                    offset + limit,
                                    policyData?.total || 0
                                ),
                                z: `${
                                    policyData?.total?.toLocaleString() ?? '0'
                                }${policyData?.total === 10000 ? '+' : ''}`,
                            })}
                        </Typography>
                        <PaginationControls
                            limit={limit}
                            offset={offset}
                            goToPage={goToPage}
                            total={policyData?.total || 0}
                        />
                    </div>
                )}
            </div>
        </DashboardContext.Provider>
    );
};
