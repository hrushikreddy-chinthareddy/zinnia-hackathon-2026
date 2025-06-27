import '@deps/styles/styles.css';
import { Meta, StoryObj } from '@storybook/react';

import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import PolicyTestCard, { PolicyTestCardProps } from './policy-test-card';

type StoryType = StoryObj<PolicyTestCardProps>;

export default {
    title: 'Containers/MEC/PolicyTestCard',
    component: PolicyTestCard,
    decorators: [
        (Story) => (
            <div className="p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof PolicyTestCard>;

const tooltipProps = {
    tooltipBody: 'this is a tooltip body',
    tooltipTitle: 'this is a tooltip title',
};

export const Default: StoryType = {
    args: {
        title: 'This is a title',
        amountProps: {
            label: 'Amount remaining',
            ...tooltipProps,
        },
        basisProps: {
            label: 'progres',
            ...tooltipProps,
        },
        totalProps: {
            label: 'total',
            ...tooltipProps,
        },
        total: 100,
        compareValue: 25,
    },
};

export const GuidelinePremiumTest: StoryType = {
    args: {
        title: 'Guideline premium test',
        amountProps: {
            label: 'Amount remaining until current guideline limit',
        },
        totalProps: {
            label: 'Total current guideline limit',
        },
        basisProps: {
            label: 'Guideline Basis',
        },
        compareValue: 279,
        total: 467,
    },
};

export const SevenPayPolicyTestCardTest: StoryType = {
    args: {
        ...GuidelinePremiumTest.args,
        title: '7-pay premium test',
        classNames: 'not-mec',
        amountProps: {
            label: 'Amount remaining until current 7-pay limit',
            ...tooltipProps,
        },
        badgeProps: {
            label: 'Not MEC',
            ...tooltipProps,
        },
        basisProps: {
            label: '7-pay premium basis',
            ...tooltipProps,
        },
        totalProps: {
            label: 'total current 7-pay premium limit',
            ...tooltipProps,
        },
        fieldDataValues: [
            {
                label: '7-pay premium test period',
                value: 'Feb 2, 2020 - Feb 1, 2026',
                caption: 'in year 2 of 7',
                tooltipTitle: '7-pay premium test period',
                tooltipBody:
                    '7-pay premium test period 7-pay premium test period',
            },
            {
                label: 'Annual 7-Pay premium',
                value: numberFormatify(12345 / 100),
                tooltipTitle: 'Annual 7-Pay premium',
                tooltipBody:
                    ' Annual 7-Pay premium Annual 7-Pay premium Annual 7-Pay premium',
            },
        ],
    },
};

export const SevenPayPolicyTestCardTestMEC: StoryType = {
    args: {
        ...SevenPayPolicyTestCardTest.args,
        amountProps: {
            label: 'Amount Excess to MEC',
        },
        compareValue: 929,
        total: 629,
        classNames: 'mec',
        badgeProps: {
            label: 'MEC',
            variant: BadgeVariant.Error,
            ...tooltipProps,
        },
        fieldDataValues: undefined,
    },
};
