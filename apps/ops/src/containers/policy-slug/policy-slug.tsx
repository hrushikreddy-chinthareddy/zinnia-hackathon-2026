import { skipToken, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import PolicyLayout from '@deps/components/policy-layout';
import { TranslationFiles } from '@deps/config/translations';
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
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { usePrefetchAgentData } from '@deps/hooks/usePrefetchAgentData';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { SorSystem } from '@deps/models/policy/enums';
import { UserPermission } from '@deps/models/user-profile';
import Custom404Page from '@deps/pages/404s';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
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
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { Party, Policy } from '@zinnia/api-types/types/sor';

export interface PolicyPageProps extends SegmentTrackedPageProps {
    policy: Policy;
    subPageTitleKey: string;
    permissions: {
        [UserPermission.AllowReadPolicyAdmin]: boolean;
        [UserPermission.AllowEditPolicy]: boolean;
    };
    selectedPolicyParty?: Party;
}

const Slugs = {
    AssigneeChange: 'assigneechange',
    BeneChange: 'benechange',
};

const PolicySlug: React.FC<PolicyPageProps> = ({
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

    // Prefetch agent data for all agent parties on the policy
    usePrefetchAgentData(policy);

    const policyDetails = useMemo(() => new PolicyDetails(policy), [policy]);

    const policyDataValue = useMemo(
        () => ({
            policy: policy as Policy,
            policyDetails,
            refreshPolicy: refetchPolicy,
        }),
        [policy, policyDetails, refetchPolicy]
    );

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
                            roleTab={slug[2]}
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
                <PolicyData.Provider value={policyDataValue}>
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

export default PolicySlug;
