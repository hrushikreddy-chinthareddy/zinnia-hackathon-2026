import { AddressType, EmailType } from '@/components/person-data/types';

export const beneficiary = {
  firstName: 'john',
  lastName: 'williams',
  partyType: 'primary',
  beneficiaryPercentage: 30,
  addresses: [
    {
      addressId: '1',
      startDate: '2024-03-04',
      endDate: '2024-03-04',
      addressType: AddressType.Residence,
      addressLine1: '1112 Pickle Street',
      addressLine2: 'South Jersey',
      addressLine3: '1234 Post box',
      city: 'Garden City',
      state: 'NJ',
      zipCode: '67846',
      zipCodeExtension: '23',
      country: 'US',
    },
  ],
  emails: [
    {
      recordID: 1,
      emailType: EmailType.Personal,
      emailAddress: 'secben585+0502v1@gmail.com',
      endDate: null,
      startDate: '2022-01-01',
    },
  ],
};
