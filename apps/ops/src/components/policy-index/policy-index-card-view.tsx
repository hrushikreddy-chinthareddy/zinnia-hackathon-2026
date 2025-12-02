import { useQuery } from '@tanstack/react-query';
import { NextRouter, useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { createContext, useContext, useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import PaginationControls from '@deps/components/pagination/pagination';
import SearchBar, {
    SearchBarInitialValues,
} from '@deps/components/search/search-bar';
import PolicySummaryCard, {
    PolicyQuickView,
} from '@deps/containers/policy-summary-card/policy-summary-card';
import SearchResults from '@deps/containers/search-results/search-results';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import {
    PolicySearchFilters,
    PolicySearchFiltersContext,
} from '@deps/contexts/PolicySearchFilters';
import { useSearchBarcontext } from '@deps/contexts/SearchBarContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
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

export const PolicyIndexCardView = ({
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

    const { searchValue, limit, offset } = policySearchFilters;

    const { featureFlags } = useOptimizely();

    const goToPage = (pageNumber: number) => {
        setPolicySearchFilters({
            ...policySearchFilters,
            offset: (pageNumber - 1) * limit,
        });
        window.scrollTo(0, 0);
    };

    const {
        data: policyData,
        isFetching: policyDataFetching,
        error: policyDataError,
    } = useQuery({
        queryKey: ['searchPolicyData', searchValue, limit, offset],
        placeholderData: (previousData) => previousData,
        queryFn: () => getPoliciesQuery(searchValue, limit, offset),
        enabled: Object.keys(searchValue).length > 0,
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
        setShowFieldErrorMessage(false);
    }, [setShowFieldErrorMessage]);

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

    const isIdle = Object.keys(policySearchFilters.searchValue).length === 0;
    const showPagination = !!policyData?.total && !!policyData?.results?.length;

    const onToggle = (value: PolicySearchKeys) => {
        const newSearchValues: PolicySearchFilters = {
            ...policySearchFilters,
            toggleValue: value,
        };
        setPolicySearchFilters(newSearchValues);
    };

    return (
        <DashboardContext.Provider
            value={{ searchValue: policySearchFilters.searchValue }}
        >
            <PageHead titleKey="policySearch" />
            <>
                <h1 className="typography-desktop-headline-1-d">
                    {t('dashboard.h1')}
                </h1>
                <SearchBar
                    searchValue={policySearchFilters.searchValue}
                    onSearch={handleSearch}
                    toggleLabels={toggleLabels(featureFlags)}
                    initialToggleValue={policySearchFilters.toggleValue}
                    onClear={async () => {
                        await removePolicyNumberFromQuery(router);
                        clearPolicySearchFilters();
                    }}
                    onToggle={onToggle}
                    handleError={setShowFieldErrorMessage}
                />

                <SearchResults
                    query={{
                        error: policyDataError,
                        isEmpty:
                            policyData?.results?.length === 0 ||
                            !policyData?.results,
                        isError: !!policyDataError,
                        isIdle,
                        isLoading: false, // SearchResults won't handle loading state; we want to skeletonize policies instead
                        isSuccess:
                            policyDataFetching === false &&
                            (!!policyData?.results ||
                                (!!policyData &&
                                    policyData?.results?.length > 0)),
                    }}
                >
                    <>
                        {policyDataFetching
                            ? Array.from({ length: 5 }).map((_, index) => (
                                  <PolicyQuickView
                                      key={'policy_skeleton_' + index}
                                      policyDetails={new PolicyDetails()}
                                      caseData={undefined}
                                      isLoading={true}
                                      showKeyValues={true}
                                  />
                              ))
                            : policyData?.results
                                  ?.filter((p) => p.policyNumber)
                                  .map((p) => {
                                      return (
                                          <PolicySummaryCard
                                              key={'policy_' + p.policyNumber}
                                              policySearchResult={p}
                                              showKeyValues={true}
                                          />
                                      );
                                  })}
                        {showPagination && (
                            <PaginationControls
                                total={policyData.total}
                                limit={limit}
                                offset={offset}
                                goToPage={goToPage}
                            />
                        )}
                    </>
                </SearchResults>
            </>
        </DashboardContext.Provider>
    );
};
