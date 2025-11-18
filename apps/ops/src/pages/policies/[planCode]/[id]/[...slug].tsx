import { getAccessToken } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import { FgaRelation, FgaRoles } from '@xd/utils';
import { Party, Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo } from 'react';

import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import PolicyLayout from '@deps/components/policy-layout';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import AnnuitizationSubPage from '@deps/containers/annuitization-sub-page';
import BeneChangeContainer from '@deps/containers/bene-change/bene-change-container';
import { BeneChangeProvider } from '@deps/containers/bene-change/bene-change-provider';
import CoverageSubPage from '@deps/containers/coverage-sub-page';
import LoansSubPage from '@deps/containers/loans-sub-page/loans-sub-page';
import PersonSubPage from '@deps/containers/person-sub-page';
import PolicyDetailsContainer from '@deps/containers/policy-details/policy-details';
import PremiumsSubPage from '@deps/containers/premiums-sub-page';
import RidersAndFeaturesSubPage from '@deps/containers/riders-and-features-sub-page/riders-and-features-sub-page';
import ActivitySubPage from '@deps/containers/subpages/activity-sub-page/activity-sub-page';
import { FilterTransactions } from '@deps/containers/subpages/activity-sub-page/filter-transactions';
import DocumentsSubPage from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import FundsSubPage from '@deps/containers/subpages/funds-sub-page';
import WithdrawalsSubPage from '@deps/containers/withdrawals-sub-page/withdrawals-sub-page';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PeopleRolesFilterProvider } from '@deps/contexts/PeopleRolesFilter';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserPermission } from '@deps/models/user-profile';
import Custom404Page from '@deps/pages/404s';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { hasPermissionQuery } from '@deps/queries/tanstack/permissionsQueries/permissions-queries';
import {
    getPolicyQuery,
    getPolicyQueryKey,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logError,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface PolicyPageProps extends SegmentTrackedPageProps {
    policy: Policy;
    subPageTitleKey: string;
    permissions: {
        [UserPermission.AllowReadPolicyAdmin]: boolean;
        [UserPermission.AllowEditPolicy]: boolean;
    };
    selectedPolicyParty?: Party;
}

const parseSlugToKey = (slug: string[] | undefined): string => {
    if (!slug || slug.length === 0) return 'policyDetails';
    const [alphaSlug, omegaSlug] = slug;
    switch (alphaSlug) {
        case 'people':
            return omegaSlug ? 'partyDetails' : alphaSlug;
        case 'transactions':
        case 'policy':
            // NOTE: policy-extras should map to ridersAndFeatures
            return omegaSlug === 'policy-extras'
                ? 'ridersAndFeatures'
                : omegaSlug.replace(/-([a-z])/g, (_, letter) =>
                      letter.toUpperCase()
                  );
        case 'activity':
        case 'documents':
            return alphaSlug;
        default:
            return 'policyDetails';
    }
};

const PolicyDetailsPage: React.FC<PolicyPageProps> = ({
    user,
    subPageTitleKey,
}: PolicyPageProps) => {
    const router = useRouter();
    const { query } = router;
    const { id, slug, planCode } = query;
    const { partyId } = usePermissionsContext();
    const { featureFlags } = useOptimizely();

    const {
        data: policy,
        isLoading: loading,
        isFetching,
        error: error,
        refetch: refetchPolicy,
    } = useQuery({
        queryKey: [getPolicyQueryKey, id, planCode],
        queryFn: () => getPolicyQuery(id as string, planCode as string),
        placeholderData: (previousData) => previousData,
    });

    const { data: canEditPolicy } = useQuery({
        queryKey: ['canEditPolicy', id, planCode, partyId],
        queryFn: () =>
            hasPermissionQuery(
                UserPermission.AllowEditPolicy,
                `policy:${id}_${planCode}`,
                partyId
            ),
        placeholderData: (previousData) => previousData,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    useSegmentPageTracker(user, SegmentPageName.PolicyDetails, {
        planCode: planCode,
        policyNumber: id,
    });

    const policyDetails = useMemo(() => new PolicyDetails(policy), [policy]);

    if (loading) {
        return (
            <PolicyLayout loading={true}>
                <div className="flex h-[500px] w-full items-center justify-center">
                    <PageHead titleKey={subPageTitleKey} />
                    <PageLoader variant={PageLoaderVariant.Center} />
                </div>
            </PolicyLayout>
        );
    }

    const isAnnuityForbiddenPage =
        policyDetails.isAnnuity &&
        slug?.[0] === 'policy' &&
        ['coverage', 'loans'].includes(slug?.[1]);

    // If there is no policy or an error occurs, route to the 404 page.
    // Do not redirect to /404, as it no longer exists as a standalone page.
    // Translations are now handled via getServerSideProps in pages/[...lng].tsx.
    if (error || !policy || isAnnuityForbiddenPage) {
        return <Custom404Page />;
    }

    let subPageContent = null;

    // policies/id/... with no slug
    if (!slug || slug.length === 0) {
        subPageContent = <PolicyDetailsContainer />;
    } else if (Array.isArray(slug)) {
        // policies/id/slug
        switch (slug[0]) {
            case 'people':
                subPageContent =
                    slug[1] && slug[1] != 'benechange' ? (
                        <PersonSubPage
                            editable={canEditPolicy}
                            partyId={slug[1]}
                        />
                    ) : (
                        (subPageContent = (
                            <BeneChangeProvider>
                                <BeneChangeContainer
                                    policy={policy}
                                    planCode={planCode as any}
                                    isReReg={false}
                                />
                            </BeneChangeProvider>
                        ))
                    );
                break;
            case 'transactions':
            case 'policy':
                if (slug[1] === 'coverage') {
                    subPageContent = <CoverageSubPage policy={policy} />;
                }

                if (slug[1] === 'policy-details') {
                    subPageContent = <PolicyDetailsContainer />;
                }

                // policy-extras is an old link.  Leaving it here for backwards compatibility
                if (
                    ['riders-and-features', 'policy-extras'].includes(slug[1])
                ) {
                    subPageContent = <RidersAndFeaturesSubPage />;
                }

                if (slug[1] === 'funds') {
                    subPageContent = <FundsSubPage policy={policyDetails} />;
                }
                if (slug[1] === 'premiums') {
                    subPageContent = <PremiumsSubPage />;
                }

                if (slug[1] === 'withdrawals') {
                    subPageContent = <WithdrawalsSubPage policy={policy} />;
                }

                if (slug[1] === 'loans') {
                    subPageContent = <LoansSubPage policy={policy} />;
                }

                if (slug[1] === 'annuitization') {
                    subPageContent = <AnnuitizationSubPage />;
                }
                break;
            case 'activity':
                if (
                    featureFlags[FEATURE_FLAGS.REVISED_HISTORY_TABLE] &&
                    slug[1] === 'transactions'
                ) {
                    subPageContent = <FilterTransactions />;
                } else {
                    subPageContent = <ActivitySubPage />;
                }
                break;
            case 'documents':
                subPageContent = <DocumentsSubPage policy={policy} />;
                break;
            default:
                subPageContent = <PolicyDetailsContainer />;
                break;
        }
    }

    return (
        <BlurOverlayLoader loading={isFetching}>
            <PolicyLayout policyDetails={policy}>
                <PolicyData.Provider
                    value={{
                        policy,
                        policyDetails: new PolicyDetails(policy),
                        refreshPolicy: refetchPolicy,
                    }}
                >
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
            const { locale = DEFAULT_LOCALE, res, req, query } = context;
            const { slug } = query;

            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('policies/:id/:slug:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            // IMH-87188-87186 (186 is the IMH you can view in JIRA)
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            if (
                featureFlagDecisions?.[
                    FEATURE_FLAGS.FGA_ENTITY_ZINNIA_LIVE_POLICY_MANAGEMENT
                ]
            ) {
                const hasPermissionToReadPolicyManagement =
                    featureFlagDecisions?.[
                        FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY
                    ]
                        ? await checkTuplePage(
                              context,
                              FgaRelation.UiAccess,
                              FgaRoles.POLICY_MANAGEMENT_ZL_ENTITY,
                              loggingContext
                          )
                        : await doesUserHavePagePermissions(
                              context,
                              UserPermission.AllowReadPolicyAdmin,
                              loggingContext
                          );
                const isAdvisorsExcel = await checkTuplePage(
                    context,
                    FgaRelation.Party,
                    AE_FGA_ROLE,
                    loggingContext
                );

                if (!isAdvisorsExcel && !hasPermissionToReadPolicyManagement) {
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
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
                        subPageTitleKey:
                            parseSlugToKey(
                                typeof slug === 'string' ? [slug] : slug
                            ) ?? null,
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
    {
        file: 'policies/[id]/[...slug]',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/:...slug',
    }
);

export default PolicyDetailsPage;
