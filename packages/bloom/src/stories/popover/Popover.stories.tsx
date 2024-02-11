import { Meta, StoryObj } from "@storybook/react";

import { Popover } from "@/components/popover";
import { PopoverPlacement } from "@/components/popover/popover.helper";

export default {
  title: "Components/Popover",
  component: Popover,
  args: {
    children: "Popover",
    placement: PopoverPlacement.TopLeft,
  },
  decorators: [
    (Story) => (
      <div className="mt-20">
        <div className="mx-auto block max-w-[20px]">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    placement: {
      options: [
        PopoverPlacement.BottomLeft,
        PopoverPlacement.BottomRight,
        PopoverPlacement.TopLeft,
        PopoverPlacement.TopRight,
      ],
      defaultValue: PopoverPlacement.BottomLeft,
    },
  },
} as Meta<typeof Popover>;

export const DefaultPopover: StoryObj<typeof Popover> = {
  args: {
    children: (
      <div>
        <p
          style={{
            paddingTop: "var(--measure-dimension-padding-xl, 0.75rem)",
          }}
        >
          Your premium is the amount you pay periodically for insurance
          coverage. What’s shown here is your next scheduled payment.
        </p>
      </div>
    ),
    title: "popover title",
    placement: PopoverPlacement.BottomRight,
  },
};
