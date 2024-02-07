import { Meta, StoryObj } from '@storybook/react';

import { formatUSDollars } from '@/utils/currency';

import { Popover } from './Popover';
import { PopoverPlacement } from './popover.helper';
import { FieldData } from '../field-data/FieldData';
import { Icon, IconType } from '../icon/Icon';

export default {
  title: 'Components/Popover',
  component: Popover,
  args: {
    children: 'Popover',
    placement: PopoverPlacement.TopLeft,
  },
  decorators: [
    Story => (
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
    children: <Icon type={IconType.CIRCLE_INFO} />,
    title: 'popover title',
    body: (
      <div>
        <FieldData
          fieldData={
            <p className="typographyContentValue">{formatUSDollars(1234)}</p>
          }
          caption={<p style={{ color: 'white' }}>As of 6/12 5:00pm EST</p>}
        />
        <p style={{ paddingTop: 'var(--measureDimensionPaddingXl, 0.75rem)' }}>
          Your premium is the amount you pay periodically for insurance
          coverage. What’s shown here is your next scheduled payment.
        </p>
      </div>
    ),
    placement: PopoverPlacement.BottomRight,
  },
};
