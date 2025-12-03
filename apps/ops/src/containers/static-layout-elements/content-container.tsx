import { Skeleton } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next';
import { PropsWithChildren } from 'react';

import { FindAllKeyValuesPolicySidesheet } from '@deps/components/find-key-values-sidesheet/find-all-key-values-policy-sidesheet';
import { FindKeyValuesSidesheet } from '@deps/components/find-key-values-sidesheet/find-key-values-sidesheet';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { useContentContext } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { usePolicyQuickLinks } from '@deps/hooks/usePolicyQuickLinks';
import { CarrierCode } from '@deps/utils/carriers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import styles from './content-container.module.css';
import QuickLinks from '../quick-links/quick-links';

interface ContentContainerProps extends PropsWithChildren {
    policy: Policy;
    openSideSheet: () => void;
    hideSearch?: boolean;
    showJointOwner?: boolean;
    showLink?: boolean;
    loading?: boolean;
}

const ContentContainer = ({
    children,
    policy,
    openSideSheet,
    hideSearch,
    showJointOwner,
    showLink,
    loading,
}: ContentContainerProps) => {
    const { t } = useTranslation();
    const { globalValuesData } = useContentContext();
    const { featureFlags } = useOptimizely();
    const SBGC: CarrierCode = 'SBGC'; // typed to prevent typos
    const showAllKeyValues = policy.carrierId
        ? policy.carrierId === SBGC
            ? featureFlags[FEATURE_FLAGS.FKV_SHOW_ALL_SB]
            : featureFlags[FEATURE_FLAGS.FKV_SHOW_ALL]
        : false;

    const {
        highlight,
        marketingName,
        productType,
        status,
        tooltip,
        tooltipAmount,
        tooltipPlacements,
        variant,
    } = globalValuesData;
    const { policyNumber, product } = policy;
    const { planCode } = product ?? {};
    const jointOwnerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.JOINTOWNER
    )?.partyId;
    const jointOwner = policy?.parties?.find(
        (party) => party.partyId === jointOwnerId
    );
    const policyDetails = new PolicyDetails(policy);
    const { parties } = policyDetails;
    const getPartiesWithRole = (role: PartyRole) =>
        parties.getPartiesWithRole(role);

    const getOwner = () => {
        const owners = getPartiesWithRole(PartyRole.OWNER);
        const activeOwner = owners.find((o) =>
            o.partyRoles.some(
                (pr) =>
                    pr.partyRole === PartyRole.OWNER && !isEndDated(pr.endDate)
            )
        );

        return (activeOwner ?? owners[0])?.party;
    };
    const owner = getOwner();
    const {
        partyId: userPartyId,
        sessionId,
        hasCallLogsAccess,
    } = usePermissionsContext();

    const { data: quickLinks, isLoading: loadingQuickLinks } =
        usePolicyQuickLinks(t, policyDetails, hasCallLogsAccess);

    return (
        <>
            {loading || !planCode || !policyNumber ? (
                <PageLoader variant={PageLoaderVariant.Center} />
            ) : (
                <>
                    <GlobalValuesBar
                        carrierId={policy?.carrierId}
                        highlight={highlight}
                        marketingName={marketingName}
                        openSideSheet={openSideSheet}
                        owner={owner}
                        jointOwner={jointOwner}
                        planCode={planCode}
                        policyNumber={policyNumber}
                        productType={productType}
                        status={status}
                        tooltip={tooltip}
                        tooltipAmount={tooltipAmount}
                        tooltipPlacements={tooltipPlacements}
                        variant={variant}
                        showJointOwner={showJointOwner}
                        showLink={showLink}
                        className="justify-between items-center"
                    >
                        {hideSearch ||
                        !policyDetails.isTPA ? null : showAllKeyValues ? (
                            <FindAllKeyValuesPolicySidesheet
                                planCode={planCode}
                                policyNumber={policyNumber}
                            />
                        ) : (
                            <FindKeyValuesSidesheet
                                planCode={planCode}
                                policyNumber={policyNumber}
                            />
                        )}
                    </GlobalValuesBar>
                    <div className={styles.contentCard}>
                        <Skeleton
                            loading={loadingQuickLinks}
                            maxWidth="550px"
                            height="24px"
                        >
                            <QuickLinks
                                userPartyId={userPartyId}
                                policy={policyDetails}
                                links={quickLinks || []}
                                sessionId={sessionId}
                                className={styles.quickLinks}
                            />
                        </Skeleton>
                        {children}
                    </div>
                </>
            )}
        </>
    );
};

export default ContentContainer;
