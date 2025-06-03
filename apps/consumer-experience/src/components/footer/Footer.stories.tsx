import { Meta, StoryObj } from '@storybook/nextjs';

import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  component: Footer,
  title: 'Components/Footer',
};

export default meta;

export const Default: StoryObj<typeof Footer> = {
  args: {},
};
