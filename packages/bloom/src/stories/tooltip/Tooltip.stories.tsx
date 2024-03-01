import { Meta, StoryObj } from "@storybook/react";
import InfoIcon from "../../tokens/svg-assets/icons/circles/circle-info.svg";

import { Tooltip, TooltipProps, TooltipPlacement} from '@/components/tooltip'

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    children: "Tooltip",
    placement: TooltipPlacement.TopLeft,
    trigger:  <InfoIcon width={16} height={16} />,
  },
  decorators: [
    (Story) => (
      <div style={{ marginTop: '300px', marginLeft: '500px'}}>
        <Story />
      </div>
    ),
  ],
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