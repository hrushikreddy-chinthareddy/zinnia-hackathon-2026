import { Meta, StoryObj } from '@storybook/react';

import { Addresses } from '../Addresses';
import { AddressProps, AddressType } from '../types';

const meta: Meta<typeof Addresses> = {
  component: Addresses,
  title: 'Components/PersonData/Addresses',
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
    addresses: [
      {
        preferredAddressIndicator: '1',
        recordID: 1,
        startDate: '2024-01-01',
        endDate: null,
        addressType: AddressType.Residence,
        addressLine1: '1609 Summit St',
        addressLine2: null,
        addressLine3: null,
        city: 'Garden City',
        state: 'KS',
        zipCode: '67846',
        zipCodeExtension: null,
        country: 'US',
      },
      {
        preferredAddressIndicator: '1',
        recordID: 2,
        startDate: '2024-01-01',
        endDate: null,
        addressType: AddressType.Business,
        addressLine1: '1609 Summit St',
        addressLine2: null,
        addressLine3: null,
        city: 'Garden City',
        state: 'KS',
        zipCode: '67846',
        zipCodeExtension: null,
        country: 'US',
      },
      {
        preferredAddressIndicator: '1',
        recordID: 3,
        startDate: '2024-01-01',
        endDate: null,
        addressType: AddressType.PoBox,
        addressLine1: '1609 Summit St',
        addressLine2: null,
        addressLine3: null,
        city: 'Garden City',
        state: 'KS',
        zipCode: '67846',
        zipCodeExtension: null,
        country: 'US',
      },
    ],
    title: 'Address',
  },
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj<AddressProps>;

export const Default: StoryType = {};

export const Single: StoryType = {
  args: {
    addresses: [
      {
        preferredAddressIndicator: '1',
        recordID: 3,
        startDate: '2024-01-01',
        endDate: null,
        addressType: AddressType.PoBox,
        addressLine1: '1609 Summit St',
        addressLine2: null,
        addressLine3: null,
        city: 'Garden City',
        state: 'KS',
        zipCode: '67846',
        zipCodeExtension: null,
        country: 'US',
      },
    ],
  },
};
