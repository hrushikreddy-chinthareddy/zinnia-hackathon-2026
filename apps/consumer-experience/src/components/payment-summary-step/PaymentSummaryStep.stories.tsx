import { Meta, StoryObj } from '@storybook/react';
import { Icon, IconType, Label, Popover } from '@zinnia/bloom/components';

import { PaymentSummaryStep } from './PaymentSummaryStep';

const meta: Meta<typeof PaymentSummaryStep> = {
  component: PaymentSummaryStep,
  title: 'Components/PaymentSummaryStep',
  args: { totalLabel: <Label>Total Deposit</Label> },
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof PaymentSummaryStep> = {
  args: {
    transactionSummary: [
      {
        label: <Label>Submitted Amount</Label>,
        value: 10000,
      },
      {
        label: (
          <Label
            interactiveElements={[
              <Popover
                key="TEXT"
                title="Fees"
                trigger={
                  <Icon
                    type={IconType.CIRCLE_INFO}
                    color="var(--color-base-icon-icon-tooltip, #ff7500)"
                    width={16}
                    height={16}
                  />
                }
              >
                <p>tooltip text</p>
              </Popover>,
            ]}
          >
            Fees
          </Label>
        ),
        value: 450,
      },
    ],
  },
};

export const ExtendedAmount: StoryObj<typeof PaymentSummaryStep> = {
  args: {
    transactionSummary: [
      {
        label: <Label>Submitted Amount</Label>,
        value: 10000000000,
      },
      {
        label: (
          <Label
            interactiveElements={[
              <Popover
                key="TEXT"
                title="Fees"
                trigger={
                  <Icon
                    type={IconType.CIRCLE_INFO}
                    color="var(--color-base-icon-icon-tooltip, #ff7500)"
                    width={16}
                    height={16}
                  />
                }
              >
                <p>tooltip text</p>
              </Popover>,
            ]}
          >
            Fees
          </Label>
        ),
        value: 4500,
      },
      {
        label: <Label>Taxes</Label>,
        value: 1500,
      },
      {
        label: (
          <Label
            interactiveElements={[
              <Popover
                key="TEXT"
                title="Misc"
                trigger={
                  <Icon
                    type={IconType.CIRCLE_INFO}
                    color="var(--color-base-icon-icon-tooltip, #ff7500)"
                    width={16}
                    height={16}
                  />
                }
              >
                <p>tooltip text</p>
              </Popover>,
            ]}
          >
            Misc
          </Label>
        ),
        value: 8150,
      },
    ],
  },
};
