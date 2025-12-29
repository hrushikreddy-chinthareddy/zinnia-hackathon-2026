import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Button from '@deps/components/button/button';
import { formatDate } from '@deps/helpers/string.helpers';
import { PolicyStatus, ProductType } from '@zinnia/api-types/types/sor';

import SideSheet from './side-sheet';
import '@deps/styles/styles.css';
import { getBadgeStatus, getBadgeStatusVariant } from '../badge/badge.helpers';
import { getPolicyBadgeStatusTooltip } from '../global-values/global-values-bar/global-values-helpers';
import PolicyInfo from '../global-values/policy-info/policy-info';

export default {
    title: 'Components/SideSheet',
    component: SideSheet,
    decorators: [
        (Story) => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SideSheet>;

export const PolicyHeader = () => {
    const [open, setOpen] = useState(true);
    const handleClose = () => setOpen(false);

    const { t } = useTranslation();

    const mockHeader = (
        <PolicyInfo
            marketingName="Everly Life"
            productType={ProductType.UNIVERSALLIFE}
            policyNumber="AU22029654"
            status={t(getBadgeStatus(PolicyStatus.ACTIVE))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(PolicyStatus.ACTIVE), {
                    tooltipDate: formatDate('2023/04/20'),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(PolicyStatus.ACTIVE)}
        />
    );

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={() => setOpen(true)}>Open SideSheet</Button>
            </div>
            <SideSheet
                open={open}
                handleClose={handleClose}
                headerElement={mockHeader}
            />
        </div>
    );
};
