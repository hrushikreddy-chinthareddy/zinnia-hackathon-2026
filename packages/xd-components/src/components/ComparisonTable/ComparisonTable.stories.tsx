import type { Meta, StoryObj } from '@storybook/react';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonTableProps } from './types';
import { Tag, TagVariant } from '@zinnia/bloom/components';

const meta: Meta<typeof ComparisonTable> = {
  title: 'Components/ComparisonTable',
  component: ComparisonTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<ComparisonTableProps>;

const bankingDetails = () => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <Tag text="EFT" variant={TagVariant.White} />
    CITI BANK
    <span>Checking ending in 1234</span>
  </div>
);

const multiColumnData: ComparisonTableProps = {
  newValueHeader: 'New autopay details',
  currentValueHeader: 'Current',
  data: {
    amount: {
      label: 'Amount',
      onEdit: console.log,
      newValue: '$88.00',
      currentValue: '$88.00',
    },
    frequency: {
      label: 'Frequency',
      isNew: true,
      newValue: 'Annually',
      currentValue: 'Monthly',
    },
    nextPaymentDate: {
      label: 'Next payment date',
      isNew: true,
      newValue: '2/28/2024',
      currentValue: '1/28/2024',
    },
    payor: {
      label: 'Payor',
      newValue: 'Flora Anderson',
      currentValue: 'Flora Anderson',
    },
    bankingDetails: {
      label: 'Banking details',
      isNew: true,
      onEdit: console.log,
      newValue: bankingDetails(),
      currentValue: bankingDetails(),
    },
  },
};

const singleColumnData: ComparisonTableProps = {
  newValueHeader: 'New autopay details',
  data: {
    amount: {
      label: 'Amount',
      onEdit: console.log,
      newValue: '$844.35',
    },
    frequency: {
      label: 'Frequency',
      isNew: true,
      newValue: 'Every 3 months',
    },
    nextPaymentDate: {
      label: 'Next payment date',
      isNew: true,
      newValue: '9/16/2025',
    },
    payor: {
      label: 'Payor',
      newValue: 'Michael Williams',
    },
    paymentMethod: {
      label: 'Payment method',
      onEdit: console.log,
      isNew: true,
      newValue: bankingDetails(),
    },
  },
};

export const Multiple: Story = {
  args: {
    newValueHeader: multiColumnData.newValueHeader,
    currentValueHeader: multiColumnData.currentValueHeader,
    data: multiColumnData.data,
  },
};

export const Single: Story = {
  args: {
    newValueHeader: singleColumnData.newValueHeader,
    data: singleColumnData.data,
  },
};
