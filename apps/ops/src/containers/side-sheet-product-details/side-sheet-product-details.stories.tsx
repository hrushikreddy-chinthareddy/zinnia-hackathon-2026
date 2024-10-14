import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import { getBadgeStatus, getBadgeStatusVariant } from '@deps/components/badge/badge.helper';
import Button from '@deps/components/button/button';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helper';
import { GlobalValues } from '@deps/components/global-values/global-values.types';
import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import { SideSheetProvider, useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { PolicyStatus, ProductType } from '@deps/models/policy/sor-policy';

import SideSheetProductDetails from './side-sheet-product-details';

const Status = 'ACTIVE';

const globalValues: GlobalValues = {
    carrierOrganizationName: 'Everly',
    marketingName: 'Everly Life',
    productType: 'UNIVERSALLIFE' as ProductType,
    planName: 'SB UL Premium Match',
    glPlanCode: 'V2201',
    planCode: 'SBFIXUL1',
    policyNumber: '1234',
    status: getBadgeStatus(Status) as PolicyStatus,
    variant: getBadgeStatusVariant(Status),
    tooltip: getPolicyBadgeStatusTooltip(Status),
};

export default {
    title: 'Containers/SideSheetProductDetails',
    component: SideSheetProductDetails,
    argTypes: {
        carrierID: {
            control: 'text',
        },
    },
    decorators: [
        Story => (
            <div className="bg-background p-10">
                <SideSheetProvider>
                    <Story />
                </SideSheetProvider>
            </div>
        ),
    ],
} as Meta<typeof SideSheetProductDetails>;

export const SideSheetProductDetailsDefault = (args: any) => {
    const sideSheet = useSideSheetContext();

    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo {...globalValues} />,
            <SideSheetProductDetails globalValues={globalValues} {...args} />
        );
        sideSheet.handleOpen(true);
    };
    return (
        <div>
            <Button onClick={openSideSheet}>Open SideSheet</Button>
        </div>
    );
};
