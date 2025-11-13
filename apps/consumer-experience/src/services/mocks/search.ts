import { PolicySearchResponse } from '@zinnia/api-types/types/search';

export const mockPolicySearchResponse: PolicySearchResponse = {
  count: 1,
  total: 1,
  next: '/policy/v1/policies/search?offset=5&limit=5',
  previous: '',
  results: [
    {
      policyNumber: 'DS00000001',
      source: 'zahara',
      planCode: 'SBFIXUL1',
      productName: 'SB UL Premium Match',
      firstName: 'John',
      lastName: 'Smith',
      policyStatus: 'PENDINGISSUED',
      lineOfBusiness: 'LIFE',
      carrierId: 'SBUL',
      companyName: 'zinnia',
      ssn: '642-05-4876',
      productType: 'UNIVERSALLIFE',
      lastUpdated: '2024-02-28T08:40:41.862Z',
      partyIds: ['Party_PI_1', 'Party_PB_Primary_Bene_1'],
      id: '922e84fa774f40c291d6d0fcb9445e3b',
    },
  ],
};
