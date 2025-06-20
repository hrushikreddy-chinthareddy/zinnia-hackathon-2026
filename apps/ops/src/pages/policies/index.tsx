import { getAccessToken } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import { FgaRoles } from '@xd/utils/dist';
import { NextRouter, useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createContext, useContext, useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import PaginationControls from '@deps/components/pagination/pagination';
import SearchBar, { SearchBarInitialValues } from '@deps/components/search/search-bar';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import PolicySummaryCard, { PolicyQuickView } from '@deps/containers/policy-summary-card/policy-summary-card';
import SearchResults from '@deps/containers/search-results/search-results';
import { PolicySearchFilters, PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { getPoliciesQuery } from '@deps/queries/tanstack/policyQueries/policyQueries';
import { LabelValue } from '@deps/types/data';
import { FgaRelation } from '@deps/types/fga';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import { SearchSubmittedEvent, SegmentPageName, SegmentTrackedEventName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const toggleLabels = (t: TFunction): LabelValue<PolicySearchKeys>[] => [
    {
        label: t('dashboard.search.buttons.policyNumber'),
        value: 'policyNumber',
        placeholder: '',
        errorMessage: t('dashboard.search.error.policyNumber') as string,
    },
    {
        label: t('dashboard.search.buttons.ssn'),
        value: 'ssn',
        fullLabel: t('dashboard.search.buttons.ssnFullLabel') ?? '',
        placeholder: t('dashboard.search.buttons.ssnPlaceholder') ?? '',
        format: '###-##-####',
        replaceValue: '-',
        errorMessage: t('dashboard.search.error.ssn') as string,
    },
    {
        label: t('dashboard.search.buttons.name'),
        value: 'firstName',
        group: [
            {
                label: t('dashboard.search.buttons.firstName'),
                value: 'firstName',
                placeholder: '',
                errorMessage: t('dashboard.search.error.firstName') as string,
            },
            {
                label: t('dashboard.search.buttons.lastName'),
                value: 'lastName',
                placeholder: '',
                errorMessage: t('dashboard.search.error.lastName') as string,
            },
        ],
    },
];

export interface DashboardContextProps {
    searchValue: SearchViewQuery;
}

export const DashboardContext = createContext<DashboardContextProps>({ searchValue: SearchBarInitialValues });

interface PolicyManagementDashboardProps extends SegmentTrackedPageProps {}

const PolicyManagementDashboard = ({ user }: PolicyManagementDashboardProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    useSegmentPageTracker(user, SegmentPageName.PolicyManagementDashboard);

    const { policySearchFilters, setPolicySearchFilters, clearPolicySearchFilters, setShowFieldErrorMessage } =
        useContext(PolicySearchFiltersContext);

    const { searchValue, limit, offset } = policySearchFilters;

    const goToPage = (pageNumber: number) => {
        setPolicySearchFilters({ ...policySearchFilters, offset: (pageNumber - 1) * limit });
        window.scrollTo(0, 0);
    };

    const {
        data: policyData,
        isFetching: policyDataFetching,
        error: policyDataError,
    } = useQuery({
        queryKey: ['searchPolicyData', searchValue, limit, offset],
        placeholderData: previousData => previousData,
        queryFn: () => getPoliciesQuery(searchValue, limit, offset),
        enabled: Object.keys(searchValue).length > 0,
    });

    const isSetSearchFromUrl = (policyNumber: string | string[] | undefined): boolean => {
        return (
            !!policyNumber &&
            (!policySearchFilters?.searchValue?.policyNumber || policySearchFilters?.searchValue?.policyNumber !== policyNumber)
        );
    };

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
        } else if (!policyNumber && policySearchFilters.searchValue?.policyNumber) {
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
                await router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
            }
        } catch (error: any) {
            browserLogError('Failed to remove policyNumber from query:', error);
        }
    };

    // Handlers
    const handleSearch = (value: SearchViewQuery) => {
        segmentAnalyticsTrackEvent<SearchSubmittedEvent>(SegmentTrackedEventName.SearchSubmitted, {
            policyNumber: value?.policyNumber,
            ssnUsed: !!value?.ssn,
            firstNameUsed: !!value?.firstName,
            lastNameUsed: !!value?.lastName,
            session_id: user.sid,
            userId: user.partyId,
        });

        // The api treats an empty string as a valid search value. Searching with an empty string in firstName and a correct
        // value in lastName will return 0 results.
        // This removes all falsy values from the search query
        // This feels like the wrong location to strip the values but I'm isolating to Policy.
        Object.keys(value).forEach(key => {
            if (isNullEmptyOrUndefined(value[key as keyof typeof value])) {
                delete value[key as keyof typeof value];
            }
        });

        const hasSearchValue = value && !!Object.keys(value).length && !(value.ssn && !/\d/.test(value.ssn));

        // Show the field error message if the search button is clicked and nothing have been entered into the field
        if (!hasSearchValue) {
            setShowFieldErrorMessage(true);
        } else {
            setShowFieldErrorMessage(false);
        }

        const newSearchValues: PolicySearchFilters = { ...policySearchFilters, searchValue: value, offset: 0 };

        setPolicySearchFilters(newSearchValues);
    };

    const isIdle = Object.keys(policySearchFilters.searchValue).length === 0;
    const showPagination = !!policyData?.total && !!policyData?.results?.length;

    const onToggle = (value: PolicySearchKeys) => {
        const newSearchValues: PolicySearchFilters = { ...policySearchFilters, toggleValue: value };
        setPolicySearchFilters(newSearchValues);
    };

    return (
        <DashboardContext.Provider value={{ searchValue: policySearchFilters.searchValue }}>
            <PageHead titleKey="policySearch" />
            <>
                <h1 className="typography-desktop-headline-1-d">{t('dashboard.h1')}</h1>
                <SearchBar
                    searchValue={policySearchFilters.searchValue}
                    onSearch={handleSearch}
                    toggleLabels={toggleLabels}
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
                        isEmpty: policyData?.results?.length === 0 || !policyData?.results,
                        isError: !!policyDataError,
                        isIdle,
                        isLoading: false, // SearchResults won't handle loading state; we want to skeletonize policies instead
                        isSuccess:
                            policyDataFetching === false && (!!policyData?.results || (!!policyData && policyData?.results?.length > 0)),
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
                                  />
                              ))
                            : policyData?.results
                                  ?.filter(p => p.policyNumber)
                                  .map(p => {
                                      return <PolicySummaryCard key={'policy_' + p.policyNumber} policySearchResult={p} />;
                                  })}
                        {showPagination && (
                            <PaginationControls total={policyData.total} limit={limit} offset={offset} goToPage={goToPage} />
                        )}
                    </>
                </SearchResults>
            </>
        </DashboardContext.Provider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('policies/index:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);
            const hasPermissionToReadPolicyManagement = featureFlagDecisions?.[FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY]
                ? await checkTuplePage(context, FgaRelation.UiAccess, FgaRoles.POLICY_MANAGEMENT_ZL_ENTITY, loggingContext)
                : await doesUserHavePagePermissions(context, UserPermission.AllowReadPolicyAdmin, loggingContext);
            const isAdvisorsExcel = await checkTuplePage(context, FgaRelation.Party, AE_FGA_ROLE, loggingContext);

            if (!isAdvisorsExcel && !hasPermissionToReadPolicyManagement) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    locale,
                    user,
                    ...translations,
                },
            };
        },
    },
    { file: 'policies/index', function: 'getServerSideProps', page: 'policies' }
);

export default PolicyManagementDashboard;
