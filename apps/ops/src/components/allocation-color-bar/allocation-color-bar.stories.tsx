import { Meta } from '@storybook/react';

import AllocationColorBar, { AllocationColor } from './allocation-color-bar';

export default {
    title: 'Components/AllocationColorBar',
    component: AllocationColorBar,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        colors: {
            control: 'select',
            options: ['bg-fuchsia-600', 'bg-green-500', 'bg-blue-500'],
        },
    },
} as Meta;

const pbColors: AllocationColor[] = [
    {
        className: 'bg-fuchsia-600',
        allocationPercentage: '50',
    },
    {
        className: 'bg-yellow-400',
        allocationPercentage: '30',
    },
    {
        className: 'bg-red-600',
        allocationPercentage: '20',
    },
];

const cbColors: AllocationColor[] = [
    {
        className: 'bg-yellow-300',
        allocationPercentage: '15',
    },
    {
        className: 'bg-red-400',
        allocationPercentage: '30',
    },
    {
        className: 'bg-lime-400',
        allocationPercentage: '55',
    },
];

export const PrimaryBeneficiaryColorBar = (args: any) => <AllocationColorBar colors={pbColors} {...args} />;

export const ContigentBeneficiaryColorBar = (args: any) => <AllocationColorBar colors={cbColors} {...args} />;
