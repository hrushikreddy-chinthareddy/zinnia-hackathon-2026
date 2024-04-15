import { Meta, StoryObj } from '@storybook/react';

import { BannerAlert, BannerVariant } from '../../components/banner-alert';

const meta: Meta<typeof BannerAlert> = {
  title: 'Components/BannerAlert',
  component: BannerAlert,
  tags: ['autodocs'],
  args: {
    bodyText: 'Test alert banner',
  },
};

export default meta;

export const Default: StoryObj<typeof BannerAlert> = {
  args: {},
};

export const Success: StoryObj<typeof BannerAlert> = {
  args: { variant: BannerVariant.Success },
};

export const Information: StoryObj<typeof BannerAlert> = {
  args: { variant: BannerVariant.Information },
};

export const Error: StoryObj<typeof BannerAlert> = {
  args: { variant: BannerVariant.Error },
};

export const Warning: StoryObj<typeof BannerAlert> = {
  args: { variant: BannerVariant.Warning },
};

export const WithCTA: StoryObj<typeof BannerAlert> = {
  args: {
    variant: BannerVariant.Warning,
    cta: { text: 'CTA text here', href: '#' },
  },
};

export const WithDismiss: StoryObj<typeof BannerAlert> = {
  args: {
    variant: BannerVariant.Warning,
    canDismiss: true,
  },
};
