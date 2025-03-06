import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { PropsWithChildren, useMemo } from 'react';

import { FindKeyValueSearch } from '@deps/components/global-values/find-key-value-search/find-key-value-search';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import { useContentContext } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { useStaticNestedNavDrawerContext } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';
import { AnnuityDetailsViewInfo, AnnuityViewDetailsDto } from '@deps/data/annuity-details-view';
import { generatePolicyAnnuityDetailsDto } from '@deps/data/details-view';
import { PolicyDetailsViewInfo, PolicyViewDetailsDto } from '@deps/data/policy-details-view';
import { fillColDefs } from '@deps/helpers/data-transform.helper';
import { LineOfBusiness, PartyRole, Policy } from '@deps/models/policy/sor-policy';

interface ContentContainerProps extends PropsWithChildren {
    policy: Policy;
    openSideSheet: () => void;
    isFullHeight?: boolean;
    hideSearch?: boolean;
    showJointOwner?: boolean;
    showLink?: boolean;
}

const ContentContainer = ({
    children,
    policy,
    openSideSheet,
    isFullHeight,
    hideSearch,
    showJointOwner,
    showLink,
}: ContentContainerProps) => {
    const { t } = useTranslation();
    const { isNavDrawerOpen } = useStaticNestedNavDrawerContext();
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

    const containerClasses = clsx(
        `flex w-full flex-col py-4 pl-[52px] transition-[padding] duration-300 sm:pr-4 md:py-6 md:pr-6 lg:py-8 lg:pr-8 [&>div]:max-w-[1130px]`,
        {
            'lg:pl-[240px]': isNavDrawerOpen,
        }
    );

    const globalValuesMemoized = useMemo(() => {
        if (Object.keys(policy).length === 0) {
            return;
        }

        return (
            <GlobalValuesBar
                carrierId={policy?.carrierId}
                highlight={highlight}
                isNavDrawerOpen={isNavDrawerOpen}
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
                    <FindKeyValueSearch
                        isNavDrawerOpen={isNavDrawerOpen}
                        keyValues={searchableDetailsData}
                        planCode={planCode}
                        policyNumber={policyNumber}
                    />
                )}
            </GlobalValuesBar>
        );
    }, [
        highlight,
        isNavDrawerOpen,
        marketingName,
        openSideSheet,
        owner,
        planCode,
        policy,
        policyNumber,
        productType,
        searchableDetailsData,
        status,
        tooltip,
        tooltipAmount,
        tooltipPlacements,
        variant,
    ]);

    return (
        <div className="w-full flex-grow sm:pl-4 md:pl-6 lg:pl-8">
            <div className={containerClasses}>
                {globalValuesMemoized}
                {children}
            </div>
        </div>
    );
};

export default ContentContainer;
