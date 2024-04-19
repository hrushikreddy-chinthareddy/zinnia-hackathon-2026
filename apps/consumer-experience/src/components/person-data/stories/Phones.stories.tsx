import { Meta, StoryObj } from '@storybook/react';
import { PhoneType } from '@zinnia/api-types/types/sor';

import { Phones } from '../Phones';
import { BestTimeType, PhoneProps } from '../types';

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
        phoneId: '1',
        startDate: '2024-01-30',
        // endDate: null,
        phoneType: PhoneType.BUSINESS,
        // countryCode: null,
        areaCode: '542',
        dialNumber: '7543111',
        extension: '1628',
        // bestTime: null,
        // timeZone: null,
      },
      {
        phoneId: '1',
        startDate: '2024-01-30',
        // endDate: null,
        phoneType: PhoneType.MOBILE,
        // countryCode: null,
        areaCode: '542',
        dialNumber: '7543111',
        // extension: null,
        bestTime: BestTimeType.Morning,
        // timeZone: null,
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
    phones: [
      {
        phoneId: '1',
        startDate: '2024-01-30',
        // endDate: null,
        phoneType: PhoneType.MOBILE,
        // countryCode: null,
        areaCode: '542',
        dialNumber: '7543111',
        extension: '1628',
        // bestTime: null,
        // timeZone: null,
      },
    ],
  },
};
