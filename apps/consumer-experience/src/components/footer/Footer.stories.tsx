import { Meta, StoryObj } from '@storybook/react';

import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  component: Footer,
  title: 'Components/Footer',
};

export default meta;

export const Default: StoryObj<typeof Footer> = {
  args: {},
};
