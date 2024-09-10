import '@deps/styles/styles.css';

import { Meta, StoryObj } from '@storybook/react';

import { ReactComponent as PaymentIcon } from '@deps/styles/elements/icons/content/payment.svg';
import { ReactComponent as AutopayIcon } from '@deps/styles/elements/icons/currency/autopay.svg';
import { ReactComponent as UserGroupIcon } from '@deps/styles/elements/icons/icons_outlined/user-group.svg';

import HistoryEventCard, { HistoryEventCardProps } from './history-event-card';

const icons = {
    PaymentIcon: <PaymentIcon width={24} height={24} className="text-primary" />,
    AutopayIcon: <AutopayIcon width={24} height={24} />,
    UserGroupIcon: <UserGroupIcon width={24} height={24} />,
    undefined: null,
};

const meta: Meta<typeof HistoryEventCard> = {
    title: 'Components/HistoryEventCard',
    component: HistoryEventCard,
    tags: ['autodocs'],
    args: {
        amount: 12000.0,
        caption: '3/13/2023',
        eventBody: 'Monthly | Checking ending in 1234',
        eventTitle: 'Premium autopay',
        icon: undefined,
        isClickable: true,
        isPending: false,
    },
    argTypes: {
        amount: {
            control: 'text',
        },
        caption: {
            control: 'text',
        },
        eventBody: {
            control: 'text',
        },
        eventTitle: {
            control: 'text',
        },
        icon: {
            options: Object.keys(icons),
            mapping: icons,
            control: {
                type: 'select',
                labels: {
                    PaymentIcon: 'Payment',
                    AutopayIcon: 'Autopay',
                    UserGroupIcon: 'UserGroup',
                    undefined: 'None',
                },
            },
        },
        isClickable: {
            control: 'boolean',
        },
        isPending: {
            control: 'boolean',
        },
    },
} as Meta<typeof HistoryEventCard>;

export default meta;

type StoryType = StoryObj<HistoryEventCardProps>;

export const Default: StoryType = {};

export const Pending: StoryType = {
    args: {
        isPending: true,
    },
};

export const NotClickable: StoryType = {
    args: {
        isClickable: false,
    },
};

export const NoBodyNoAmountNotClickable: StoryType = {
    args: {
        amount: undefined,
        eventBody: undefined,
        eventTitle: 'Policy activation',
        isClickable: false,
    },
};
