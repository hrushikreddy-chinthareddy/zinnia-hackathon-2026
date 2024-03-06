import { Meta, StoryObj } from "@storybook/react";
import InfoIcon from "../../tokens/svg-assets/icons/circles/circle-info.svg";
import { Tooltip, TooltipProps, TooltipPlacement } from '@/components/tooltip'

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    children: "Tooltip",
    placement: TooltipPlacement.TopLeft,
    trigger: <InfoIcon width={16} height={16} />,
  },
  parameters: {
    // centered layout makes sense here for the placement to be visible
    layout: 'centered'
  },
  argTypes: {
    placement: {
      options: [
        TooltipPlacement.BottomLeft,
        TooltipPlacement.BottomRight,
        TooltipPlacement.TopLeft,
        TooltipPlacement.TopRight,
      ],
      defaultValue: TooltipPlacement.BottomLeft,
    },
  },
}

export default meta;
type StoryType = StoryObj<TooltipProps>;

export const Default: StoryType = {};

export const TopLeft: StoryType = {
  args: {
    placement: TooltipPlacement.TopLeft
  }
}

export const TopRight: StoryType = {
  args: {
    placement: TooltipPlacement.TopRight
  }
}

export const BottomRight: StoryType = {
  args: {
    placement: TooltipPlacement.BottomRight
  }
}


export const MoreContent: StoryType = {
  args: {
    children: (
      <div>
        <p
          style={{
            paddingBottom: "var(--measure-dimension-padding-xl, 0.75rem)",
          }}
        >
          Your premium is the amount you pay periodically for insurance
          coverage. What’s shown here is your next scheduled payment.
        </p>
        <p
        >
          Your base coverage is some other amount
        </p>
      </div>
    )
  }
};