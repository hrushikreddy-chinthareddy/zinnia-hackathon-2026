import { Meta, StoryObj } from '@storybook/react';

import { ControlledSidesheet } from './ControlledSidesheet';

const meta: Meta<typeof ControlledSidesheet> = {
  component: ControlledSidesheet,
  title: 'Components/ControlledSidesheet',
  args: {
    children: <div>Test content</div>,
    header: 'This is the header',
    trigger: <div>Trigger</div>,
    closeBeforeContent: <div>Close before content</div>,
  },
};

export default meta;

export const Default: StoryObj<any> = {
  args: {
    children: <div>Test content</div>,
    header: 'This is the header',
    trigger: <div>Trigger</div>,
    closeBeforeContent: <div>Close before content</div>,
  },
};
