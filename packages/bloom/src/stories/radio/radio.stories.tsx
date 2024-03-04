import { Meta, StoryObj } from '@storybook/react';

import { Radio, RadioProps } from '@/components/radio';

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  args: {
    isDisabled: false,
    groupLabel: 'Radio Group',
    defaultValue: 'option1',
    options: [
      {
        label: 'Option 1',
        ariaLabel: 'Option 1',
        value: 'option1'
      },
      {
        label: 'Option 2',
        ariaLabel: 'Option 2',
        value: 'option2'
      },
      {
        label: 'Option 3',
        ariaLabel: 'Option 3',
        value: 'option3'
      },
    ]
  },
};

export default meta;
type StoryType = StoryObj<RadioProps>;

export const Default: StoryType = {};

export const Disabled: StoryType = {
  args: {
    isDisabled: true,
    groupLabel: 'Ice Cream Flavors',
    defaultValue: 'strawberry',
    options: [
      {
        label: 'Vanilla',
        ariaLabel: 'vanilla',
        value: 'vanilla'
      },
      {
        label: 'Chocolate',
        ariaLabel: 'chocolate',
        value: 'chocolate'
      },
      {
        label: 'Strawberry',
        ariaLabel: 'strawberry',
        value: 'strawberry'
      },
    ]
  },
};