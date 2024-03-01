import { Meta, StoryObj } from '@storybook/react';

import { Checkbox, CheckboxProps } from '@/components/checkbox';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  args: {
    isChecked: false,
    isDisabled: false,
    label: 'Label',
    // mode: "primary",
    children: "Checkbox text",
    "aria-label": "click me",
  },
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
};

export default meta;
type StoryType = StoryObj<CheckboxProps>;

export const Default: StoryType = {};

export const Checked: StoryType = {
  args: {
    isChecked: true,
    children: "Checkbox text",
  },
};

export const Disabled: StoryType = {
  args: {
    isDisabled: true,
    children: "Checkbox text",
  },
};