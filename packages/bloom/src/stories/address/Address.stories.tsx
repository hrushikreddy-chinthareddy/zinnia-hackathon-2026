import { Meta, StoryObj } from '@storybook/react';

import { Address } from '../../components/address';

export default { title: 'ComponentS/Address', component: Address } as Meta<
  typeof Address
>;

export const DefaultAddress: StoryObj<typeof Address> = {
  args: {
    addrLine1: '30 LARK DRIVE',
    city: 'BELLEMEAD',
    state: 'VT',
    zipCode: '08502',
    addrCountry: 'US',
  },
};
