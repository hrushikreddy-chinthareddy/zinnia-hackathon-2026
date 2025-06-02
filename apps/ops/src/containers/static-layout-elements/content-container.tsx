import { LineOfBusiness, PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { PropsWithChildren } from 'react';

import { FindKeyValueSearch } from '@deps/components/global-values/find-key-value-search/find-key-value-search';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { useContentContext } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { AnnuityDetailsViewInfo, AnnuityViewDetailsDto } from '@deps/data/annuity-details-view';
import { generatePolicyAnnuityDetailsDto } from '@deps/data/details-view';
import { PolicyDetailsViewInfo, PolicyViewDetailsDto } from '@deps/data/policy-details-view';
import { fillColDefs } from '@deps/helpers/data-transform.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import styles from './content-container.module.css';
import QuickLinks from '../quick-links/quick-links';
import { getPolicyQuickLinks } from '../quick-links/quick-links.helpers';

interface ContentContainerProps extends PropsWithChildren {
    policy: Policy;
    openSideSheet: () => void;
    hideSearch?: boolean;
    showJointOwner?: boolean;
    showLink?: boolean;
    loading?: boolean;
}

const ContentContainer = ({ children, policy, openSideSheet, hideSearch, showJointOwner, showLink, loading }: ContentContainerProps) => {
    const { t } = useTranslation();
    const { globalValuesData } = useContentContext();

    const { highlight, marketingName, productType, status, tooltip, tooltipAmount, tooltipPlacements, variant } = globalValuesData;
    const { partyRoles, policyNumber, product } = policy;
    const { planCode } = product ?? {};
    const { partyId: ownerID } = partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER) ?? {};
    const owner = policy?.parties?.find(party => party.partyId === ownerID);
    const jointOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.JOINTOWNER)?.partyId;
    const jointOwner = policy?.parties?.find(party => party.partyId === jointOwnerId);

    const searchableDetailsDto = generatePolicyAnnuityDetailsDto(policy);
    const colDefFunction = policy.product?.lineOfBusiness === LineOfBusiness.LIFE ? PolicyDetailsViewInfo : AnnuityDetailsViewInfo;
    const searchableDetailsData = fillColDefs<PolicyViewDetailsDto | AnnuityViewDetailsDto>(
        searchableDetailsDto,
        colDefFunction(),
        t,
        'colDefs:policyDetails'
    );

    const policyDetails = new PolicyDetails(policy);
    const { partyId: userPartyId, sessionId } = usePermissionsContext();

    return (
        <>
            {loading ? (
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
                    >
                        {hideSearch ? null : (
                            <FindKeyValueSearch keyValues={searchableDetailsData} planCode={planCode} policyNumber={policyNumber} />
                        )}
                    </GlobalValuesBar>
                    <div className={styles.contentCard}>
                        <QuickLinks
                            userPartyId={userPartyId}
                            policy={policyDetails}
                            links={getPolicyQuickLinks(t, policyDetails)}
                            sessionId={sessionId}
                            className={styles.quickLinks}
                        />
                        {children}
                    </div>
                </>
            )}
        </>
    );
};

export default ContentContainer;
