import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { PropsWithChildren, useMemo } from 'react';

import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import NestedNavDrawer from '@deps/components/nested-nav-drawer/nested-nav-drawer';
import { PopoverPlacement } from '@deps/components/popover/popover';
import SideSheetProductDetails from '@deps/containers/side-sheet-product-details/side-sheet-product-details';
import ContentContainer from '@deps/containers/static-layout-elements/content-container';
import { StaticContentProvider } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { StaticNestedNavDrawerProvider } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { Policy } from '@deps/models/policy/sor-policy';

interface PageLayoutProps extends PropsWithChildren {
    policyDetails?: Policy;
    children: React.ReactNode;
}

const PolicyLayout: React.FC<PageLayoutProps> = ({ policyDetails, children }) => {
    const { t } = useTranslation();
    const { query } = useRouter();
    const sideSheet = useSideSheetContext();

    const policy = policyDetails || ({} as Policy);
    const policyId = policy?.policyNumber ?? (query.id as string);
    const planCode = policy?.product?.planCode ?? (query.planCode as string);

    const classes = 'height-adjusted flex w-full';

    const openSideSheet = () => {
        if (globalValuesData) {
            sideSheet.changeSideSheetContent(
                <PolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} openSideSheet={undefined} />,
                <SideSheetProductDetails globalValues={globalValuesData} />
            );
            sideSheet.handleOpen(true);
        }
    };

    const globalValuesData = useMemo(() => (policyDetails ? policyDataToGlobalValues(policyDetails, t) : null), [policyDetails, t]);

    return (
        <StaticNestedNavDrawerProvider>
            <div className={classes}>
                <NestedNavDrawer planCode={planCode} policyId={policyId} />
                <StaticContentProvider policy={policy}>
                    <ContentContainer policy={policy} openSideSheet={openSideSheet}>
                        {children}
                    </ContentContainer>
                </StaticContentProvider>
            </div>
        </StaticNestedNavDrawerProvider>
    );
};

export default PolicyLayout;
