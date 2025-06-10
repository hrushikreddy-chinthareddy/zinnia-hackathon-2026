import { Meta, StoryObj } from '@storybook/nextjs';
import { AddressType, Country, State } from '@zinnia/api-types/types/sor';

import { Addresses } from '../Addresses';
import { AddressProps } from '../types';

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
    preferredAddressIndicator: '1',
    addresses: [
      {
        // preferredAddressIndicator: '1',
        addressId: '1',
        startDate: '2024-01-01',
        // endDate: null,
        addressType: AddressType.RESIDENCE,
        addressLine1: '1609 Summit St',
        // addressLine2: null,
        // addressLine3: null,
        city: 'Garden City',
        state: 'KS' as State,
        zipCode: '67846',
        // zipCodeExtension: null,
        country: 'US' as Country,
      },
      {
        // preferredAddressIndicator: '1',
        addressId: '2',
        startDate: '2024-01-01',
        // endDate: null,
        addressType: AddressType.BUSINESS,
        addressLine1: '1609 Summit St',
        // addressLine2: null,
        // addressLine3: null,
        city: 'Garden City',
        state: 'KS' as State,
        zipCode: '67846',
        // zipCodeExtension: null,
        country: 'US' as Country,
      },
      {
        // preferredAddressIndicator: '1',
        addressId: '3',
        startDate: '2024-01-01',
        // endDate: null,
        addressType: AddressType.POBOX,
        addressLine1: '1609 Summit St',
        // addressLine2: null,
        // addressLine3: null,
        city: 'Garden City',
        state: 'KS' as State,
        zipCode: '67846',
        // zipCodeExtension: null,
        country: 'US' as Country,
      },
    ],
  },
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj<AddressProps>;

export const Default: StoryType = {};

export const Single: StoryType = {
  args: {
    preferredAddressIndicator: '1',
    addresses: [
      {
        // preferredAddressIndicator: '1',
        addressId: '1',
        startDate: '2024-01-01',
        // endDate: null,
        addressType: AddressType.POBOX,
        addressLine1: '1609 Summit St',
        // addressLine2: null,
        // addressLine3: null,
        city: 'Garden City',
        state: 'KS' as State,
        zipCode: '67846',
        // zipCodeExtension: null,
        country: 'US' as Country,
      },
    ],
  },
};
