import { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from '@zinnia/bloom/components';

import { KeyValueLabelGroup } from './KeyValueLabel';

const args = [
  {
    title: 'Field 1',
    children: [
      {
        title: 'Value 1',
      },
    ],
  },
  {
    title: 'Field 2',
    children: [
      {
        title: 'Value 2',
      },
    ],
  },
];

const meta: Meta<typeof KeyValueLabelGroup> = {
  component: KeyValueLabelGroup,
  title: 'Components/KeyValueLabelGroup',
  args: {
    fields: args,
  },
};

export default meta;

export const Default: StoryObj<typeof KeyValueLabelGroup> = {};

export const WithMultipleValues: StoryObj<typeof KeyValueLabelGroup> = {
  args: {
    fields: [
      {
        title: 'Field 1',
        children: [
          {
            title: 'Value 1',
          },
          {
            title: 'Value 2',
          },
        ],
      },
    ],
  },
};

export const WithCustomComponents: StoryObj<typeof KeyValueLabelGroup> = {
  args: {
    fields: [
      {
        title: 'Field 1',
        children: [
          {
            title: 'Value 1',
            customComponent: <Button>I have a button!</Button>,
          },
        ],
      },
    ],
  },
};
