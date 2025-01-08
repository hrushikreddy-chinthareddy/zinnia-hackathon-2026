import { Meta, StoryObj } from '@storybook/react';

import { ReactComponent as DocumentReportIcon } from '@deps/styles/elements/icons/files/document-report.svg';
import { generateBankDetails } from '@deps/utils/mock/mockBankDetails';
import { generateAdditionalCharges } from '@deps/utils/mock/mockPolicyValues';
import { iconArgTypes, storybookContainerDecorator } from '@deps/utils/storybook';

import UpcomingPaymentCard from './card-upcoming-payment';
import { UpcomingPaymentCardProps } from './card-upcoming-payment.types';

import '@deps/styles/styles.css';

type StoryType = StoryObj<UpcomingPaymentCardProps>;

const manageBarLabels = [
    { text: 'Manage autopay', href: '#' },
    {
        text: 'Make one-time payment',
        href: '#',
        isDisabled: true,
        tooltip: 'Transaction error.',
    },
];

const meta: Meta<typeof UpcomingPaymentCard> = {
    title: 'Components/Cards/UpcomingPaymentCard',
    component: UpcomingPaymentCard,
    args: {
        paymentDate: '3/28/2029',
        bankDetails: generateBankDetails('partyId', 'fullName'),
        autopayAmount: 80,
        additionalCharges: generateAdditionalCharges(5),
        // manage bar
        footerLinks: manageBarLabels,
    },
    argTypes: {
        ...iconArgTypes,
        inactiveIcon: iconArgTypes.icon,
        title: {
            control: 'text',
        },
        inactiveHeaderText: {
            control: 'text',
        },
        inactiveText: {
            control: 'text',
        },
        paymentText: {
            control: 'text',
        },
        paymentDateText: {
            control: 'text',
        },
        paymentFrequencyText: {
            control: 'text',
        },
        autopayText: {
            control: 'text',
        },
        startLoanText: {
            control: 'text',
        },
    },
    decorators: [storybookContainerDecorator],
};

export default meta;

export const Default: StoryType = {};

export const Inactive: StoryType = {
    args: {
        paymentDate: undefined,
        autopayText: 'Set up autopay',
    },
};

export const ThreeLinks: StoryType = {
    args: {
        footerLinks: [...manageBarLabels, { text: 'Start a new loan', href: '#' }],
    },
};

export const CustomIcon: StoryType = {
    args: {
        icon: <DocumentReportIcon width={24} height={24} className="text-primary" />,
    },
};

export const WithTooltips: StoryType = {
    args: {
        additionalCharges: generateAdditionalCharges(8, true),
    },
};
