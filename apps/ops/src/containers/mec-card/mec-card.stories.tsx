import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import MECCard from './mec-card';

export default {
    title: 'Containers/MEC',
    component: MECCard,
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
        Story => (
            <div className="p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof MECCard>;

const guidelinesYTDCard = {
    title: 'Premium Card',
    cardLabel: 'Card Label',
    cardLabelTooltip: 'Card Label Tooltip',
    compareValue: 23,
    total: 34,
    progressBarLabel: 'Progress Bar Label',
    progressBarLabelPopover: 'Progress Bar Label Popover',
};

const guidelinesAllTimeCard = {
    title: 'All Time Card',
    cardLabel: 'Card Label',
    cardLabelTooltip: 'Card Label Tooltip',
    compareValue: 6435,
    total: 23242,
    progressBarLabel: 'Progress Bar Label',
    progressBarLabelPopover: 'Progress Bar Label Popover',
};

const sevenYearCard = {
    title: 'Seven year Time Card',
    cardLabel: 'Card Label',
    cardLabelTooltip: 'Card Label Tooltip',
    compareValue: 929,
    total: 83,
    progressBarLabel: 'Progress Bar Label',
    progressBarLabelPopover: 'Progress Bar Label Popover',
};

export const MECCardDefault = (args: any) => (
    <MECCard
        isMEC={true}
        guidelinesYTDCard={guidelinesYTDCard}
        guidelinesAllTimeCard={guidelinesAllTimeCard}
        sevenYearCard={sevenYearCard}
        {...args}
    />
);
