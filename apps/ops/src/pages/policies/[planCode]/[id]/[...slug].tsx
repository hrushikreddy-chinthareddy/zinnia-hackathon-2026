import { getAccessToken } from '@auth0/nextjs-auth0';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
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
import PremiumsSubPage from '@deps/containers/premiums-sub-page';
import RidersAndFeaturesSubPage from '@deps/containers/riders-and-features-sub-page/riders-and-features-sub-page';
import SelfServeTransactionContainer from '@deps/containers/self-serve-transaction/self-serve-transaction-container';
import { SelfServeTransactionProvider } from '@deps/containers/self-serve-transaction/self-serve-transaction-provider';
import { getSelfServeTransactionData } from '@deps/containers/self-serve-transaction/self-serve-transaction.helpers';
import { SelfServeTransaction } from '@deps/containers/self-serve-transaction/types';
import ActivitySubPage from '@deps/containers/subpages/activity-sub-page/activity-sub-page';
import CallLogs from '@deps/containers/subpages/activity-sub-page/call-logs';
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
import { SorSystem } from '@deps/models/policy/enums';
import { UserPermission } from '@deps/models/user-profile';
import Custom404Page from '@deps/pages/404s';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { checkBeneficiaryEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
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
import { FgaRelation, FgaRoles } from '@deps/utils/auth';
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
import { Party, Policy } from '@zinnia/api-types/types/sor';
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

const Slugs = {
    AssigneeChange: 'assigneechange',
    BeneChange: 'benechange',
};

const PolicyDetailsPage: React.FC<PolicyPageProps> = ({
    user,
    subPageTitleKey,
}: PolicyPageProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'selfServeTransaction',
    });
    const router = useRouter();
    const { query } = router;
    const { id, slug, planCode } = query;
    const { partyId, sessionId } = usePermissionsContext();
    const { featureFlags } = useOptimizely();
    const [transactionData, setTransactionData] = useState<any | null>(null);
    const [beneficiaryEligibility, setBeneficiaryEligibility] =
        useState<boolean>(false);

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

    const { data: beneficiaryEligibilityData } = useQuery({
        queryKey: ['beneficiaryEligibility', planCode, policy?.policyNumber],
        queryFn:
            planCode && policy?.policyNumber
                ? () =>
                      checkBeneficiaryEligibilityQuery(
                          planCode as string,
                          policy?.policyNumber as string
                      )
                : skipToken,
        enabled: !!planCode && !!policy?.policyNumber,
    });

    useSegmentPageTracker(user, SegmentPageName.PolicyDetails, {
        planCode: planCode,
        policyNumber: id,
    });

    const policyDetails = useMemo(() => new PolicyDetails(policy), [policy]);

    const getTransactionData = useCallback(async () => {
        let transactionType;
        if (slug && slug.length > 0) {
            switch (slug[1]) {
                case Slugs.AssigneeChange:
                    transactionType = SelfServeTransaction.ASSIGNEE_CHANGE;
                    break;
                case Slugs.BeneChange:
                    transactionType = SelfServeTransaction.BENE_CHANGE;
                    break;
            }
            const transactionPayload = await getSelfServeTransactionData(
                transactionType as SelfServeTransaction,
                policy as Policy,
                planCode as string
            );
            setTransactionData(transactionPayload);
        }
    }, [slug, policy, planCode]);

    const getBeneficiaryEligibility = useCallback(() => {
        if (!beneficiaryEligibilityData) return;
        const sor = (beneficiaryEligibilityData?.sor ?? '').toLowerCase();
        const isZahara = sor === SorSystem.Zahara.toLowerCase();
        const isEligible = isZahara
            ? beneficiaryEligibilityData?.status ===
              TransactionResponseStatus.Success
            : !!sor;
        setBeneficiaryEligibility(isEligible);
    }, [beneficiaryEligibilityData]);

    useEffect(() => {
        if (!policy || !planCode) return;
        getTransactionData();
        getBeneficiaryEligibility();
    }, [policy, planCode, getTransactionData, getBeneficiaryEligibility]);

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
                subPageContent = slug[1] ? (
                    slug[1] === Slugs.AssigneeChange ||
                    slug[1] === Slugs.BeneChange ? (
                        transactionData && (
                            <SelfServeTransactionProvider>
                                <SelfServeTransactionContainer
                                    initialCustomData={
                                        transactionData.initialCustomData
                                    }
                                    initialFormData={
                                        transactionData.initialFormData
                                    }
                                    transactionType={
                                        transactionData.transactionType
                                    }
                                    policy={policy}
                                    metaData={transactionData.metaData}
                                    parentPage={transactionData.parentPage}
                                    leaveTransactionLink={
                                        transactionData.leaveTransactionLink
                                    }
                                    processType={transactionData.processType}
                                    processSubType={
                                        transactionData.processSubType
                                    }
                                    startStepSubtitle={
                                        t(transactionData?.startStepSubtitle) ??
                                        ''
                                    }
                                    submitResponseHandler={transactionData?.submitResponseHandler(
                                        policy,
                                        sessionId,
                                        partyId
                                    )}
                                    confirmStepSubtitle={t(
                                        transactionData?.confirmStepSubtitle
                                    )}
                                />
                            </SelfServeTransactionProvider>
                        )
                    ) : (
                        <PersonSubPage
                            editable={canEditPolicy}
                            partyId={slug[1]}
                        />
                    )
                ) : (
                    <PeopleSubPage
                        isEligibleBeneficiary={beneficiaryEligibility}
                    />
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
                if (featureFlags[FEATURE_FLAGS.REVISED_HISTORY_TABLE]) {
                    if (slug[1] === 'transactions')
                        subPageContent = <FilterTransactions />;
                    if (slug[1] === 'call-logs') subPageContent = <CallLogs />;
                } else {
                    // remove once the revised_history_table feature flag is cleaned up
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
