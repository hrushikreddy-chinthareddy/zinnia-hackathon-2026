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
    label: 'Radio Label',
    ariaLabel: "click me",
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
    children: "Radio text",
  },
};