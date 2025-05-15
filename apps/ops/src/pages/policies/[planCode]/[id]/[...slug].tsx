import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useContext } from 'react';

import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import PolicyLayout from '@deps/components/policy-layout';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import AnnuitizationSubPage from '@deps/containers/annuitization-sub-page';
import CoverageSubPage from '@deps/containers/coverage-sub-page';
import LoansSubPage from '@deps/containers/loans-sub-page/loans-sub-page';
import PeopleSubPage from '@deps/containers/people-sub-page';
import PersonSubPage from '@deps/containers/person-sub-page';
import PolicyDetailsContainer from '@deps/containers/policy-details/policy-details';
import PolicyDetailsSubPage from '@deps/containers/policy-details-sub-page';
import PremiumsSubPage from '@deps/containers/premiums-sub-page';
import RidersAndFeaturesSubPage from '@deps/containers/riders-and-features-sub-page/riders-and-features-sub-page';
import ActivitySubPage from '@deps/containers/subpages/activity-sub-page/activity-sub-page';
import DocumentsSubPage from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import FundsSubPage from '@deps/containers/subpages/funds-sub-page';
import WithdrawalsSubPage from '@deps/containers/withdrawals-sub-page/withdrawals-sub-page';
import { PeopleRolesFilterProvider } from '@deps/contexts/PeopleRolesFilter';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { PolicySearchFiltersContext } from '@deps/contexts/PolicySearchFilters';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { PolicyAllOfPartiesItem, Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { hasPermissionQuery } from '@deps/queries/tanstack/permissionsQueries/permissions-queries';
import { getPolicyQuery } from '@deps/queries/tanstack/policyQueries/policyQueries';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';
import { FgaRelation } from '@deps/types/fga';
import { PolicySearchResponse } from '@deps/types/search';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { logError, logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { FgaRoles } from '@xd/utils/dist';

interface PolicyPageProps extends SegmentTrackedPageProps {
    policy: Policy;
    permissions: {
        [UserPermission.AllowReadPolicyAdmin]: boolean;
        [UserPermission.AllowEditPolicy]: boolean;
    };
    selectedPolicyParty?: PolicyAllOfPartiesItem;
    showAudio: boolean;
    canUnmask: boolean;
}

const PolicyDetailsPage: React.FC<PolicyPageProps> = ({ user, showAudio, canUnmask }) => {
    const router = useRouter();
    const { query } = router;
    const { id, slug, planCode } = query;
    const { partyId } = usePermissionsContext();

    const { policySearchFilters } = useContext(PolicySearchFiltersContext);
    const { searchValue, limit, offset } = policySearchFilters;
    const queryClient = useQueryClient();

    useSegmentPageTracker(user, SegmentPageName.PolicyDetails, {
        planCode: planCode,
        policyNumber: id,
    });

    const {
        data: policy,
        isLoading: loading,
        isFetching,
        error: error,
        refetch: refetchPolicy,
    } = useQuery({
        queryKey: ['policyData', id, planCode],
        queryFn: () => getPolicyQuery(id as string, planCode as string),
        initialData: () => {
            const initialData = queryClient
                .getQueryData<PolicySearchResponse>(['policyData', searchValue, limit, offset])
                ?.results?.find(policy => policy.policyNumber == id);

            return initialData;
        },
        placeholderData: previousData => previousData,
    });

    const { data: canEditPolicy } = useQuery({
        queryKey: ['canEditPolicy', id, planCode, partyId],
        queryFn: () => hasPermissionQuery(UserPermission.AllowEditPolicy, `policy:${id}_${planCode}`, partyId),
        placeholderData: previousData => previousData,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    if (loading) {
        return (
            <PolicyLayout loading={true}>
                <div className="flex h-[500px] w-full items-center justify-center">
                    <PageLoader variant={PageLoaderVariant.Center} />
                </div>
            </PolicyLayout>
        );
    }

    // If there is no policy or an error occurs, route to the 404 page.
    // trigger a router reload also, because we need the 404 to load from the server to get the translations
    if (error || !policy) {
        router.push('/404');
        router.reload();
        return;
    }

    let subPageContent = null;
    let subPageTitleKey = '';
    const policyDetails = new PolicyDetails(policy);

    // policies/id/... with no slug
    if (!slug || slug.length === 0) {
        subPageContent = <PolicyDetailsSubPage />;
        subPageTitleKey = 'policyDetails';
    } else if (Array.isArray(slug)) {
        // policies/id/slug
        switch (slug[0]) {
            case 'people':
                // policies/id/people/personId or policies/id/people
                subPageContent = slug[1] ? <PersonSubPage editable={canEditPolicy} partyId={slug[1]} /> : <PeopleSubPage />;
                subPageTitleKey = slug[1] ? 'partyDetails' : 'people';
                break;
            case 'transactions':
            case 'policy':
                if (slug[1] === 'coverage') {
                    subPageContent = <CoverageSubPage policy={policy} />;
                    subPageTitleKey = 'coverage';
                }

                if (slug[1] === 'policy-details') {
                    subPageContent = <PolicyDetailsContainer />;
                    subPageTitleKey = 'policyDetails';
                }

                // policy-extras is an old link.  Leaving it here for backwards compatibility
                if (['riders-and-features', 'policy-extras'].includes(slug[1])) {
                    subPageContent = <RidersAndFeaturesSubPage />;
                    subPageTitleKey = 'ridersAndFeatures';
                }

                if (slug[1] === 'funds') {
                    subPageContent = <FundsSubPage policy={policyDetails} />;
                    subPageTitleKey = 'funds';
                }
                if (slug[1] === 'premiums') {
                    subPageContent = <PremiumsSubPage />;
                    subPageTitleKey = 'premiums';
                }

                if (slug[1] === 'withdrawals') {
                    subPageContent = <WithdrawalsSubPage policy={policy} />;
                    subPageTitleKey = 'withdrawals';
                }

                if (slug[1] === 'loans') {
                    subPageContent = <LoansSubPage policy={policy} />;
                    subPageTitleKey = 'loans';
                }

                if (slug[1] === 'annuitization') {
                    subPageContent = <AnnuitizationSubPage />;
                    subPageTitleKey = 'annuitization';
                }
                break;
            case 'activity':
                subPageContent = <ActivitySubPage showAudio={showAudio} canUnmask={canUnmask} />;
                subPageTitleKey = 'activity';
                break;
            case 'documents':
                subPageContent = <DocumentsSubPage policy={policy} />;
                subPageTitleKey = 'documents';
                break;
            default:
                subPageContent = <PolicyDetailsContainer />;
                subPageTitleKey = 'policyDetails';
                break;
        }
    }

    return (
        <BlurOverlayLoader loading={isFetching}>
            <PolicyLayout policyDetails={policy}>
                <PolicyData.Provider value={{ policy, policyDetails: new PolicyDetails(policy), refreshPolicy: refetchPolicy }}>
                    {/* Only the sub pages re-render on filter changes */}
                    <PeopleRolesFilterProvider>
                        <PageHead titleKey={subPageTitleKey} />
                        {subPageContent}
                    </PeopleRolesFilterProvider>
                </PolicyData.Provider>
            </PolicyLayout>
        </BlurOverlayLoader>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req } = context;
            const session = await getSession(req, res);
            const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('policies/:id/:slug:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);
            const showAudio: boolean = featureFlagDecisions?.[FEATURE_FLAGS.CALL_AUDIO_FEATURE];
            const hasPermissionToReadPolicyManagement = featureFlagDecisions?.[FEATURE_FLAGS.ENTERPRISE_SEARCH]
                ? await checkTuplePage(context, FgaRelation.UiAccess, FgaRoles.POLICY_MANAGEMENT_ZL_ENTITY, loggingContext)
                : await doesUserHavePagePermissions(
                    context,
                    UserPermission.AllowReadPolicyAdmin,
                    loggingContext
                );
            const isAdvisorsExcel = await checkTuplePage(context, FgaRelation.Party, AE_FGA_ROLE, loggingContext);

            if (!isAdvisorsExcel && !hasPermissionToReadPolicyManagement) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            try {
                const translations = await serverSideTranslations(
                    locale,
                    [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                    nextI18nextConfig,
                    ALL_LOCALES
                );

                return {
                    props: {
                        ...translations,
                        user,
                        showAudio,
                        canUnmask,
                    },
                };
            } catch (error) {
                // TODO: Perhaps redirect to a 500 page?
                logError('policies/:id/:slug:: Error fetching translations', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                });

                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }
        },
    },
    { file: 'policies/[id]/[...slug]', function: 'getServerSideProps', page: 'policies/:planCode/:id/:...slug' }
);

export default PolicyDetailsPage;
