import '@deps/styles/styles.css';

import BannerAlert, {
    BannerAlertProps,
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BannerAlert> = {
    title: 'Components/BannerAlert',
    component: BannerAlert,
    tags: ['autodocs'],
    args: {
        children:
            'Insert body text about reminders, updates, and/or notifications.',
        canDismiss: true,
    },
    argTypes: {
        cta: {
            control: 'radio',
            options: ['No CTA', 'CTA'],
            mapping: {
                'No CTA': undefined,
                CTA: {
                    text: 'CTA text here',
                    href: '',
                },
            },
        },
        variant: {
            control: 'select',
            options: Object.values(BannerVariant),
        },
    },
};

export default meta;

type StoryType = StoryObj<BannerAlertProps>;

export const Default: StoryType = {};

export const WithCTA: StoryType = {
    args: {
        cta: {
            text: 'CTA text here',
            href: '',
        },
    },
};

export const Error: StoryType = {
    args: {
        variant: BannerVariant.Error,
    },
};

export const Information: StoryType = {
    args: {
        variant: BannerVariant.Information,
    },
};

export const Success: StoryType = {
    args: {
        variant: BannerVariant.Success,
    },
};

export const Warning: StoryType = {
    args: {
        variant: BannerVariant.Warning,
    },
};

export const Bold: StoryType = {
    args: {
        children: (
            <>
                We can also handle <b>bold text</b>.
            </>
        ),
        variant: BannerVariant.Warning,
    },
};
