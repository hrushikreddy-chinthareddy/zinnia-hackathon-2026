import { Meta, StoryObj } from '@storybook/react';

import { Footer } from './Footer';

export default { title: 'Components/Footer', component: Footer } as Meta<
  typeof Footer
>;

export const Default: StoryObj<typeof Footer> = {
  args: {},
};
