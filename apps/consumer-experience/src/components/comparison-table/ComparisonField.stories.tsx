import { Meta, StoryObj } from '@storybook/nextjs';
import { Tag, TagVariant } from '@zinnia/bloom/components';

import { ComparisonField } from './ComparisonField';
import { ComparisonFieldProps } from './types';

const meta: Meta<typeof ComparisonField> = {
  title: 'Components/ComparisonTable/ComparisonField',
  component: ComparisonField,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<ComparisonFieldProps>;

export const Default: Story = {
  args: {
    subtext: 'Insert text',
    isNew: true,
  },
};

export const WithEditableHeader: Story = {
  args: {
    header: 'Amount',
    subtext: <i>$88.00</i>,
    onEdit: console.log,
  },
};

export const BankingDetails: Story = {
  args: {
    header: 'Payment method',
    subtext: (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Tag text="EFT" variant={TagVariant.White} />
        <b>Citi Bank</b>
        <span>Checking ending in 1234</span>
      </div>
    ),
    isNew: true,
    onEdit: console.log,
  },
};
