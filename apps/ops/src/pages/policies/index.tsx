import { getAccessToken } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import { TFunction, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createContext, useContext } from 'react';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import PaginationControls from '@deps/components/pagination/pagination';
import SearchBar, { SearchBarInitialValues } from '@deps/components/search/search-bar';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import { PolicyQuickView } from '@deps/containers/policy-summary-card/policy-summary-card';
import SearchResults from '@deps/containers/search-results/search-results';
import { PolicySearchFilters, PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { getPoliciesQuery } from '@deps/queries/tanstack/policyQueries/policyQueries';
import { LabelValue } from '@deps/types/data';
import { FgaRelation } from '@deps/types/fga';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import { SearchSubmittedEvent, SegmentPageName, SegmentTrackedEventName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
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
        queryKey: ['policyData', searchValue, limit, offset],
        placeholderData: previousData => previousData,
        queryFn: () => getPoliciesQuery(searchValue, limit, offset),
        enabled: Object.keys(searchValue).length > 0,
    });

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

    const onToggle = (value: PolicySearchKeys) => {
        const newSearchValues: PolicySearchFilters = { ...policySearchFilters, toggleValue: value };
        setPolicySearchFilters(newSearchValues);
    };

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
                        initialToggleValue={policySearchFilters.toggleValue}
                        onClear={() => {
                            clearPolicySearchFilters();
                        }}
                        onToggle={onToggle}
                        handleError={setShowFieldErrorMessage}
                    />
                </div>

                <SearchResults
                    query={{
                        error: policyDataError,
                        isEmpty: policyData?.results?.length === 0 || !policyData?.results,
                        isError: !!policyDataError,
                        isIdle: Object.keys(policySearchFilters.searchValue).length === 0,
                        isLoading: policyDataFetching,
                        isSuccess:
                            policyDataFetching === false && (!!policyData?.results || (!!policyData && policyData?.results?.length > 0)),
                    }}
                >
                    <>
                        {policyData?.results
                            ?.filter(p => p.policyNumber)
                            .map(p => {
                                return <PolicyQuickView key={'policy_' + p.policyNumber} policy={p} />;
                            })}
                        {policyData && <PaginationControls total={policyData.total} limit={limit} offset={offset} goToPage={goToPage} />}
                    </>
                </SearchResults>
            </NoNavLayout>
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
            // If they can't read Policy Admin there's no point in continuing. Redirect to 403 Forbidden.
            const doesUserHasPagePermissions = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadPolicyAdmin,
                loggingContext
            );
            const isAdvisorsExcel = await checkTuplePage(context, FgaRelation.Party, AE_FGA_ROLE, loggingContext);

            if (!isAdvisorsExcel && !doesUserHasPagePermissions) {
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
