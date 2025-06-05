import { Meta, StoryObj } from '@storybook/react';
import { Phone, PhoneType } from '@zinnia/api-types/types/sor';

import { Phones } from '../Phones';
import { PhoneProps } from '../types';

const mockPhoneNumber: Phone = {
  phoneId: '1',
  phoneType: PhoneType.MOBILE,
  startDate: '2024-01-30',
  countryCode: '1',
  areaCode: '542',
  dialNumber: '7543111',
  extension: '1628',
};

const meta: Meta<typeof Phones> = {
  component: Phones,
  title: 'Components/PersonData/Phones',
  decorators: [
    Story => (
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.25rem',
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    phones: [
      {
        ...mockPhoneNumber,
        phoneType: PhoneType.BUSINESS,
      },
      {
        ...mockPhoneNumber,
        phoneId: '2',
      },
    ],
    title: 'Phone',
  },
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj<PhoneProps>;

export const Default: StoryType = {};

export const Single: StoryType = {
  args: {
    phones: [mockPhoneNumber],
  },
};
