import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import router from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import PaginationControls from '@deps/components/pagination/pagination';
import SearchBar, { SearchBarInitialValues } from '@deps/components/search/search-bar';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyQuickView } from '@deps/containers/policy-summary-card/policy-summary-card';
import SearchResults from '@deps/containers/search-results/search-results';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicySearchFilters, PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { searchPolicy } from '@deps/queries/api/policies';
import { isResetQueryParam } from '@deps/types/constants';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import { SearchSubmittedEvent, SegmentPageName, SegmentTrackedEventName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './index.module.css';

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

const initialResults = {
    policies: null,
    loading: false,
    error: false,
    total: 0,
};

interface PolicySearchResultsProps {
    policies: Policy[] | null;
    loading: boolean;
    error: unknown | boolean;
    total: number;
}

export interface DashboardContextProps {
    searchValue: SearchViewQuery;
}

export const DashboardContext = createContext<DashboardContextProps>({ searchValue: SearchBarInitialValues });

interface PolicyManagementDashboardProps extends SegmentTrackedPageProps {}

const PolicyManagementDashboard = ({ user }: PolicyManagementDashboardProps) => {
    const { t } = useTranslation();

    useSegmentPageTracker(user, SegmentPageName.PolicyManagementDashboard);

    const { policySearchFilters, setPolicySearchFilters, clearPolicySearchFilters, setShowFieldErrorMessage } =
        useContext(PolicySearchFiltersContext);
    const [policySearchResults, setPolicySearchResults] = useState<PolicySearchResultsProps>(initialResults);
    const limit = 5; // Hardcoding to 5 for now.
    const [offset, setOffset] = useState(0);
    const [loadSearchResults, setLoadSearchResults] = useState(false);
    const [isIdle, setIsIdle] = useState(true);
    const { featureFlags } = useOptimizely();

    const goToPage = (pageNumber: number) => {
        setOffset((pageNumber - 1) * limit);
        window.scrollTo(0, 0);
    };

    const fetchPolicies = useCallback(
        async (value: SearchViewQuery) => {
            try {
                setPolicySearchResults({
                    policies: null,
                    loading: true,
                    error: false,
                    total: 0,
                });

                const disableAnnuities = !featureFlags[FEATURE_FLAGS.POLICY_MANAGEMENT_ANNUITIES_ENABLED];

                const response = await searchPolicy(
                    {
                        ...value,
                        ...(disableAnnuities ? { lineOfBusiness: 'LIFE' } : {}),
                    },
                    { limit, offset }
                );

                setPolicySearchResults({
                    policies: response.results,
                    loading: false,
                    error: false,
                    total: response.total,
                });
            } catch (error) {
                console.error(error);
                setPolicySearchResults({
                    policies: null,
                    loading: false,
                    error,
                    total: 0,
                });
            }
        },
        [offset, !!featureFlags[FEATURE_FLAGS.POLICY_MANAGEMENT_ANNUITIES_ENABLED]]
    );

    useEffect(() => {
        const clearResults = () => {
            setPolicySearchResults({ ...initialResults });
        };

        const handleRouteChangeComplete = (url: string) => {
            if (url.indexOf(isResetQueryParam) !== -1) {
                setLoadSearchResults(false);
                clearResults();
            }
        };

        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, []);

    // Handlers
    const handleSearch = (value: SearchViewQuery) => {
        // we don't want to search on initial load so we wait until a user clicks Search to allow fetching of results
        setLoadSearchResults(true);
        setIsIdle(false);

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

        const hasSearchValue = value && !!Object.keys(value).length;
        // Show the field error message if the search button is clicked and nothing have been entered into the field
        if (!hasSearchValue) {
            setShowFieldErrorMessage(true);
            setIsIdle(true);
        } else {
            setShowFieldErrorMessage(false);
        }

        const newSearchValues: PolicySearchFilters = { ...policySearchFilters, searchValue: value };

        setPolicySearchFilters(newSearchValues);
        setOffset(0);
    };

    useEffect(() => {
        // initial value of polichSearchFilters.searchValue is `{}`
        // if any keys are present then this will return true
        // we then know we are returning from a search
        const searchValueIsSet = !!Object.keys(policySearchFilters.searchValue).length;

        // don't fetch search results on initial page load. Wait until the Search button is clicked
        // unless
        // if something is in the search value we know we are returning from a previous search. Fetch results
        if (loadSearchResults && searchValueIsSet) {
            fetchPolicies(policySearchFilters.searchValue);
        }
    }, [loadSearchResults, policySearchFilters.searchValue, fetchPolicies]);

    return (
        <DashboardContext.Provider value={{ searchValue: policySearchFilters.searchValue }}>
            <PageHead titleKey="policySearch" />
            <NoNavLayout displayTopNavBar={false}>
                <div className="flex flex-col items-center xl:items-start">
                    <Typography variant={TypographyVariant.H1} className="md:mb-8 mb-4">
                        {t('dashboard.h1')}
                    </Typography>
                    <SearchBar
                        searchValue={policySearchFilters.searchValue}
                        onSearch={handleSearch}
                        toggleLabels={toggleLabels}
                        initialToggleValue={'policyNumber' as PolicySearchKeys}
                        onClear={() => {
                            setIsIdle(true);
                            clearPolicySearchFilters();
                        }}
                        className={styles.searchBar}
                    />
                </div>

                <SearchResults
                    query={{
                        error: policySearchResults.error,
                        isEmpty: policySearchResults.policies?.length === 0,
                        isError: !!policySearchResults.error,
                        isIdle: isIdle || policySearchResults.policies === null,
                        isLoading: policySearchResults.loading,
                        isSuccess: policySearchResults.error === false && policySearchResults.loading === false,
                    }}
                >
                    <>
                        {policySearchResults.policies
                            ?.filter(p => p.policyNumber)
                            .map(p => {
                                return <PolicyQuickView key={'policy_' + p.policyNumber} policy={p} />;
                            })}
                    </>
                </SearchResults>
                {!!policySearchResults?.total && (
                    <PaginationControls total={policySearchResults.total} limit={limit} offset={offset} goToPage={goToPage} />
                )}
            </NoNavLayout>
        </DashboardContext.Provider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        // Get the user object from the Auth0 Session
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, res, req } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('policies/index:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'policies/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }
        // If they can't read Policy Admin there's no point in continuing. Redirect to 403 Forbidden.
        const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadPolicyAdmin);

        if (!doesUserHasPagePermissions) {
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
});

export default PolicyManagementDashboard;
