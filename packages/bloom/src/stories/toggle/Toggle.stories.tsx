import { Meta, StoryObj } from '@storybook/react';

import { Toggle, ToggleProps } from '@/components/toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  args: {
    text: "primary",
    pressed: false,
    isDisabled: false
  },
} as Meta<typeof Toggle>;

export default meta;
type StoryType = StoryObj<ToggleProps>;

export const Default: StoryType = {};

export const Pressed: StoryType = {
  args: {
    pressed: true,
  }
};

export const Disabled: StoryType = {
  args: {
    isDisabled: true,
  }
};

