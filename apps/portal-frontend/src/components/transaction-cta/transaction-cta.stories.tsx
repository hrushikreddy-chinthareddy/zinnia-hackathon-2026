import TransactionCta, { TransactionCtaProps } from '@deps/components/transaction-cta/transaction-cta';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TransactionCta> = {
    title: 'Components/TransactionCta',
    component: TransactionCta,
    tags: ['autodocs'],
    args: {
        mainCta: {
            text: 'Continue',
            onClick: () => console.log('Clicked Main CTA'),
        },
    },
    argTypes: {},
};

export default meta;

type StoryType = StoryObj<TransactionCtaProps>;

export const Default: StoryType = {};

export const WithSecondaryCta: StoryType = {
    args: {
        secondaryCta: {
            text: 'Leave this transaction',
            href: '',
        },
    },
};
