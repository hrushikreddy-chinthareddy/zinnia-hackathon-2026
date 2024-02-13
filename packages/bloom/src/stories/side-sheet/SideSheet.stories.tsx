import { Meta, StoryObj } from "@storybook/react";

import { SideSheet } from "@/components/side-sheet";

export default {
  title: "Components/SideSheet",
  component: SideSheet,
  tags: ["autodocs"],
} as Meta<typeof SideSheet>;

export const DefaultSideSheet: StoryObj<typeof SideSheet> = {
  args: {
    header: <h2>Title Content</h2>,
    children: <div>Child content</div>,
    trigger: <button>trigger?</button>,
  },
};
