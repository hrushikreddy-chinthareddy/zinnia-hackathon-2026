import { Meta, StoryObj } from '@storybook/react';

import { Radio, RadioProps } from '@/components/radio';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
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
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
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