import { Meta, StoryObj } from '@storybook/react';

import { ControlledSidesheet } from './ControlledSidesheet';

const meta: Meta<typeof ControlledSidesheet> = {
  component: ControlledSidesheet,
  title: 'Components/ControlledSidesheet',
  args: {
    children: <div>Test content</div>,
    header: 'This is the header',
    trigger: <div>Trigger</div>,
    closeBeforeContent: 'Close before content',
  },
};

export default meta;

export const Default: StoryObj<typeof ControlledSidesheet> = {
  args: {
    children: <div>Test content</div>,
    header: 'This is the header',
    trigger: <div>Trigger</div>,
    closeBeforeContent: 'Close before content',
  },
};
