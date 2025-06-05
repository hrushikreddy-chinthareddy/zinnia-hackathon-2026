import { Meta, StoryObj } from '@storybook/react';
import {
  AddressType,
  Country,
  EmailType,
  PartyRole,
  PartyType,
  PhoneType,
  State,
} from '@zinnia/api-types/types/sor';

import { PolicyParty } from '@/types/policy';

import { PartyList, PartyListProps } from './PartyList';

const meta: Meta<typeof PartyList> = {
  component: PartyList,
  title: 'Components/PartyList',
};

export default meta;

const testParties: PolicyParty[] = [
  {
    firstName: 'John',
    lastName: 'Smith',
    addresses: [
      {
        addressId: '1',
        startDate: '2022-07-11',
        addressType: AddressType.RESIDENCE,
        addressLine1: '30 LARK DRIVE',
        city: 'BELLEMEAD',
        state: State.AA,
        zipCode: '08502',
        country: Country.US,
      },
    ],
    phones: [
      {
        phoneId: '1',
        startDate: '2022-07-11',
        phoneType: PhoneType.MOBILE,
        countryCode: '1',
        areaCode: '318',
        dialNumber: '9873960',
        extension: '0919',
        bestTime: 'Any time after 7:00pm',
      },
    ],
    emails: [
      {
        emailId: '1',
        startDate: '2022-07-11',
        emailType: EmailType.PERSONAL,
        emailAddress: 'secben585+0502v1@gmail.com',
      },
    ],
    partyId: '123',

    fullName: '',
    partyRoles: [PartyRole.OWNER, PartyRole.PAYOR],
    partyType: PartyType.INDIVIDUAL,
  },
];

export const DefaultBankData: StoryObj<PartyListProps> = {
  args: {
    parties: [...testParties, ...testParties, ...testParties, ...testParties],
  },
};
