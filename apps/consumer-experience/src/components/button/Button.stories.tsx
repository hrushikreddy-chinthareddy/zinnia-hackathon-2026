import { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from './Button';
import { UserProvider } from '../providers/UserProvider';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button',
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div>
        <UserProvider user={undefined}>
          <Story />
        </UserProvider>
      </div>
    ),
  ],
};

export default meta;
export const Default: StoryObj<typeof Button> = {
  args: {
    children: 'Button',
  },
};

export const Loading: StoryObj<typeof Button> = {
  args: {
    children: 'Button',
    loading: true,
  },
};
