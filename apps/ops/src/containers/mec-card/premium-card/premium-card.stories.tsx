import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import PremiumCard from './premium-card';

export default {
    title: 'Containers/MEC/PremiumCard',
    component: PremiumCard,
    argTypes: {
        title: {
            control: 'text',
        },
        cardLabel: {
            control: 'text',
        },
        cardLabelTooltip: {
            control: 'text',
        },
        compareValue: {
            control: 'number',
        },
        total: {
            control: 'number',
        },
        progressBarLabel: {
            control: 'text',
        },
        progressBarLabelPopover: {
            control: 'text',
        },
    },
    decorators: [
        (Story) => (
            <div className="p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof PremiumCard>;

export const PremiumCardDefault = (args: any) => (
    <PremiumCard
        title={'Premium Card'}
        cardLabel={'Card Label'}
        cardLabelTooltip={'Card Label Tooltip'}
        compareValue={23}
        total={34}
        progressBarLabel={'Progress Bar Label'}
        progressBarLabelPopover={'Progress Bar Label Popover'}
        {...args}
    />
);
