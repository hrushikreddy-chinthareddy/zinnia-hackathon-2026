import { Meta, StoryObj } from '@storybook/react';
import { Icon, IconType, Label } from '@zinnia/bloom/components';

import { FieldData, FieldDataProps } from './FieldData';

const meta: Meta<typeof FieldData> = {
  component: FieldData,
  title: 'Components/FieldData',
  tags: ['autodocs'],
  argTypes: {
    iconType: {
      description: 'Select from icon types',
      control: 'select',
      options: ['none', ...Object.values(IconType)],
    },
  },
  render: ({ ...args }) => (
    <FieldData {...args}>
      <p className="typography-content-value">$250,343.12</p>
    </FieldData>
  ),
};

export default meta;

export const Default: StoryObj<FieldDataProps> = {
  args: {
    caption: 'As of 6/12/2023 5:00 pm EST',
    large: true,
    iconType: IconType.MAIL,
    Label: (
      <Label
        labelFor="AccountValue"
        interactiveElements={[
          // eslint-disable-next-line react/jsx-key
          <Icon
            type={IconType.CIRCLE_INFO}
            width={16}
            height={16}
            color="var(--color-base-icon-icon-tooltip, #ff7500)"
          />,
        ]}
      >
        AccountValue
      </Label>
    ),
  },
};
