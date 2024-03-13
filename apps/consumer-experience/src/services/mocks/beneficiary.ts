import { AddressType, EmailType } from '@zinnia/api-types/types/sor';

export const beneficiary = {
  firstName: 'john',
  lastName: 'williams',
  partyType: 'primary',
  beneficiaryPercentage: 30,
  addresses: [
    {
      startDate: '2024-03-04',
      endDate: '2024-03-04',
      addressType: AddressType.RESIDENCE,
      addressLine1: '1112 Pickle Street',
      addressLine2: 'South Jersey',
      addressLine3: '1234 Post box',
      city: 'Garden City',
      state: 'NJ',
      zipCode: '67846',
      zipCodeExtension: '23',
      country: 'US',
      recordID: 2,
    },
  ],
  emails: [
    {
      emailId: '1',
      emailType: EmailType.PERSONAL,
      emailAddress: 'secben585+0502v1@gmail.com',
      endDate: null,
      startDate: '2022-01-01',
    },
  ],
};
