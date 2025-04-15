import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { PropsWithChildren, useMemo } from 'react';

import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import NestedNavDrawer from '@deps/components/nested-nav-drawer/nested-nav-drawer';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { getNavLinks, NestedSubLink } from '@deps/config/nav.config';
import SideSheetProductDetails from '@deps/components/side-sheet/side-sheet-product-details/side-sheet-product-details';
import ContentContainer from '@deps/containers/static-layout-elements/content-container';
import { StaticContentProvider } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { StaticNestedNavDrawerProvider } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Policy } from '@deps/models/policy/sor-policy';

interface PageLayoutProps extends PropsWithChildren {
    policyDetails?: Policy;
    children: React.ReactNode;
    navLinks?: NestedSubLink[];
    loading?: boolean;
    isFullHeight?: boolean;
    hideSearch?: boolean;
    showJointOwner?: boolean;
    showLink?: boolean;
}

const PolicyLayout: React.FC<PageLayoutProps> = ({
    navLinks,
    loading = false,
    policyDetails = {} as Policy,
    children,
    isFullHeight,
    hideSearch,
    showJointOwner,
    showLink,
}) => {
    const { t } = useTranslation();
    const { pathname } = useRouter();
    const sideSheet = useSideSheetContext();

    const policy = new PolicyDetails(policyDetails);

    const nestedNavLinks = useMemo(() => {
        if (navLinks) {
            return navLinks;
        }
        if (!policy?.policyNumber) {
            return [];
        }

        return getNavLinks(policy, t);
    }, [navLinks, policy, t]);

    const classes = 'flex w-full';

    const openSideSheet = () => {
        if (globalValuesData) {
            sideSheet.changeSideSheetContent(
                <PolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} openSideSheet={undefined} />,
                <SideSheetProductDetails globalValues={globalValuesData} />
            );
            sideSheet.handleOpen(true);
        }
    };

    const globalValuesData = useMemo(() => (policyDetails.policyNumber ? policyDataToGlobalValues(policy, t) : null), [policy, t]);

    return (
        <StaticNestedNavDrawerProvider>
            <div className={classes}>
                <NestedNavDrawer navLinks={nestedNavLinks} isFullHeight={isFullHeight} loading={loading} pathname={pathname} />
                <StaticContentProvider policy={policyDetails}>
                    <ContentContainer
                        showJointOwner={showJointOwner}
                        hideSearch={hideSearch}
                        isFullHeight={isFullHeight}
                        policy={policyDetails}
                        openSideSheet={openSideSheet}
                        showLink={showLink}
                    >
                        {children}
                    </ContentContainer>
                </StaticContentProvider>
            </div>
        </StaticNestedNavDrawerProvider>
    );
};

export default PolicyLayout;
