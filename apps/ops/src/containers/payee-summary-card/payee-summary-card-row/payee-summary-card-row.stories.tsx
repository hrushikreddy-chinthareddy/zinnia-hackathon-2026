import { Meta, StoryObj } from '@storybook/react';

import PayeeSummaryCardRow, {
    PayeeSummaryCardRowProps,
} from './payee-summary-card-row';

export default {
    title: 'Containers/PayeeSummaryCard/Row',
    component: PayeeSummaryCardRow,
    decorators: [
        (Story) => (
            <div
                className="container"
                style={{
                    backgroundColor:
                        'var(--color-base-surface-surface-primary)',
                    padding: 'var(--measure-dimension-padding-xl)',
                }}
            >
                <Story />
            </div>
        ),
    ],
} as Meta<typeof PayeeSummaryCardRow>;

export const Default: StoryObj<PayeeSummaryCardRowProps> = {
    args: {
        amount: '($750.00)',
        percentage: '(15%)',
        label: 'label',
        popoverTitle: 'Withdrawal Charge',
        popoverBody: 'Withdrawal Body',
    },
};
