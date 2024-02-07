import { Meta, StoryObj } from '@storybook/react';
import Bloom from '@zinnia/bloom/components';

import { FieldData, FieldDataProps } from './FieldData';
import { Icon, IconType } from '../icon/Icon';

export default {
  title: 'Components/FieldData',
  component: FieldData,
  tags: ['autodocs'],
  argTypes: {
    iconType: {
      description: 'Select from icon types',
      control: 'select',
      options: ['none', ...Object.values(IconType)],
    },
  },
} as Meta<typeof FieldData>;

export const Default: StoryObj<FieldDataProps> = {
  args: {
    fieldData: <p className="typographyContentValue">$250,343.12</p>,
    caption: 'As of 6/12/2023 5:00 pm EST',
    large: true,
    iconType: IconType.MAIL,
    Label: (
      <Bloom.Label
        text="AccountValue"
        labelFor="AccountValue"
        interactiveElements={[
          // eslint-disable-next-line react/jsx-key
          <Icon
            type={IconType.CIRCLE_INFO}
            width={16}
            height={16}
            color="var(--colorPrimaryColorPrimary, #ff7500)"
          />,
        ]}
      />
    ),
  },
};
