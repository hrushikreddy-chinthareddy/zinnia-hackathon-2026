import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import React, { PropsWithChildren, useMemo } from 'react';

import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import { PopoverPlacement } from '@deps/components/popover/popover';
import SideSheetProductDetails from '@deps/components/side-sheet/side-sheet-product-details/side-sheet-product-details';
import ContentContainer from '@deps/containers/static-layout-elements/content-container';
import { StaticContentProvider } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

interface PageLayoutProps extends PropsWithChildren {
    policyDetails?: Policy;
    children: React.ReactNode;
    loading?: boolean;
    hideSearch?: boolean;
    showJointOwner?: boolean;
    showLink?: boolean;
}

const PolicyLayout: React.FC<PageLayoutProps> = ({
    loading = false,
    policyDetails = {} as Policy,
    children,
    hideSearch,
    showJointOwner,
    showLink,
}) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();

    const policy = new PolicyDetails(policyDetails);

    const openSideSheet = () => {
        if (globalValuesData) {
            sideSheet.changeSideSheetContent(
                <PolicyInfo
                    tooltipPlacements={PopoverPlacement.BottomLeft}
                    {...globalValuesData}
                    openSideSheet={undefined}
                />,
                <SideSheetProductDetails globalValues={globalValuesData} />
            );
            sideSheet.handleOpen(true);
        }
    };

    const globalValuesData = useMemo(
        () =>
            policyDetails.policyNumber
                ? policyDataToGlobalValues(policy, t)
                : null,
        [policy, t]
    );

    return (
        <StaticContentProvider policy={policyDetails}>
            <ContentContainer
                showJointOwner={showJointOwner}
                hideSearch={hideSearch}
                policy={policyDetails}
                openSideSheet={openSideSheet}
                showLink={showLink}
                loading={loading}
            >
                {children}
            </ContentContainer>
        </StaticContentProvider>
    );
};

export default PolicyLayout;
