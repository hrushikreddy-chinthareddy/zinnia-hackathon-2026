import { Meta, StoryObj } from '@storybook/nextjs';

import { ConfirmDialog } from './ConfirmDialog';
import { UserProvider } from '../providers/UserProvider';

const meta: Meta<typeof ConfirmDialog> = {
  component: ConfirmDialog,
  title: 'Components/ConfirmDialog',
  tags: ['autodocs'],
  args: {
    inline: false,
    linkText: 'Click to open dialog',
    message: 'Click Yes or No to close dialog',
    title: 'This is the title',
  },
  argTypes: {
    message: {
      description: 'The message to be displayed as the body of the dialog',
    },
    cancelCallback: {
      description: 'The callback to be called when the cancel button is clicked',
    },
    cancelText: {
      description: 'The text to be displayed on the cancel button',
    },
    confirmCallback: {
      description: 'The callback to be called when the confirm button is clicked',
    },
    confirmDescription: {
      description: 'Aria description for the confirm button',
    },
    confirmText: {
      description: 'The text to be displayed on the confirm button',
    },
    linkText: {
      description: 'The text to be displayed on the button that opens the dialog',
    },
    title: {
      description: 'The title to be displayed at the top of the dialog, in the title bar',
    },
  },
  decorators: Story => (
    <UserProvider user={undefined}>
      <Story />
    </UserProvider>
  ),
};

export default meta;
export const Default: StoryObj<typeof ConfirmDialog> = {
  args: {
    message: 'Are you sure you want to delete this item?',
  },
};

export const Inline: StoryObj<typeof ConfirmDialog> = {
  args: {
    inline: true,
  },
  decorators: Story => (

    <p>
      The inline props causes the the
      <Story />
      button to be rendered inline with the text
    </p>

  ),
};