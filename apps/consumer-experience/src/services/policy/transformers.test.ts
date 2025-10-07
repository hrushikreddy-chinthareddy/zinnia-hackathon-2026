import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import {
  getPartyRolesFromPolicyPartyId,
  transformPolicyForFundDetails,
} from './transformers';

jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

describe('transformPolicyForFundDetails', () => {
  it('should handle if funds are missing allocations but have fund values', () => {
    const policy: Policy = {
      allocation: {
        fundAllocationsInvestments: [
          {
            fundId: '2',
            fundName: 'Fund 2',
            allocationPercentage: 50,
          },
        ],
        funds: [
          {
            fundId: '1',
            fundName: 'Fund 1',
            totalFundValue: 1000,
          },
          {
            fundId: '2',
            fundName: 'Fund 2',
            totalFundValue: 2000,
          },
        ],
      },
    };
    const result = transformPolicyForFundDetails(policy);
    expect(result).toEqual([
      {
        fundAccountType: undefined,
        fundId: '2',
        fundName: 'Fund 2',
        allocationPercentage: 50,
        totalFundValue: 2000,
      },
      {
        fundAccountType: undefined,
        fundId: '1',
        fundName: 'Fund 1',
        totalFundValue: 1000,
      },
    ]);
  });

  it('should merge policy allocations and funds correctly', () => {
    const policy: Policy = {
      allocation: {
        fundAllocationsInvestments: [
          {
            fundId: '1',
            fundName: 'Fund 1',
            allocationPercentage: 25,
          },
          {
            fundId: '2',
            fundName: 'Fund 2',
            allocationPercentage: 50,
          },
        ],
        funds: [
          {
            fundId: '1',
            fundName: 'Fund 1',
            totalFundValue: 1000,
          },
          {
            fundId: '2',
            fundName: 'Fund 2',
            totalFundValue: 2000,
          },
        ],
      },
    };
    const result = transformPolicyForFundDetails(policy);
    expect(result).toEqual([
      {
        fundId: '1',
        fundName: 'Fund 1',
        allocationPercentage: 25,
        totalFundValue: 1000,
      },
      {
        fundId: '2',
        fundName: 'Fund 2',
        allocationPercentage: 50,
        totalFundValue: 2000,
      },
    ]);
  });

  it('should ignore end-dated allocations', () => {
    const policy: Policy = {
      allocation: {
        fundAllocationsInvestments: [
          {
            fundId: '1',
            fundName: 'Fund 1',
            allocationPercentage: 0.5,
            endDate: '2022-01-01',
          },
          {
            fundId: '2',
            fundName: 'Fund 2',
            allocationPercentage: 0.3,
          },
        ],
        funds: [
          {
            fundId: '1',
            fundName: 'Fund 1',
            totalFundValue: 1000,
          },
          {
            fundId: '2',
            fundName: 'Fund 2',
            totalFundValue: 2000,
          },
        ],
      },
    };
    const result = transformPolicyForFundDetails(policy);
    expect(result).toEqual([
      {
        fundAccountType: undefined,
        fundId: '2',
        fundName: 'Fund 2',
        allocationPercentage: 0.3,
        totalFundValue: 2000,
      },
      {
        fundAccountType: undefined,
        fundId: '1',
        fundName: 'Fund 1',
        totalFundValue: 1000,
      },
    ]);
  });
});

describe('getPartyRolesFromPolicyPartyId', () => {
  // Mock Policy object with correct structure
  const mockPolicy: Policy = {
    policyNumber: 'POL123',
    partyRoles: [
      { partyId: 'PARTY001', partyRole: PartyRole.OWNER },
      { partyId: 'PARTY001', partyRole: PartyRole.INSURED },
      { partyId: 'PARTY002', partyRole: PartyRole.PAYOR },
      { partyId: 'PARTY003', partyRole: PartyRole.PRIMARYBENEFICIARY },
      { partyId: 'PARTY004', partyRole: undefined },
      { partyId: 'PARTY005' }, // No partyRole property
    ],
  };

  test('should return all party roles for a specific party ID', () => {
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: 'PARTY001',
      policy: mockPolicy,
    });
    expect(result).toEqual([PartyRole.OWNER, PartyRole.INSURED]);
  });

  test('should return a single party role when party has only one role', () => {
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: 'PARTY002',
      policy: mockPolicy,
    });
    expect(result).toEqual([PartyRole.PAYOR]);
  });

  test('should return an empty array when party ID does not exist in policy', () => {
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: 'NONEXISTENT',
      policy: mockPolicy,
    });
    expect(result).toEqual([]);
  });

  test('should filter out undefined party roles', () => {
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: 'PARTY004',
      policy: mockPolicy,
    });
    expect(result).toEqual([]);
  });

  test('should handle party entries without partyRole property', () => {
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: 'PARTY005',
      policy: mockPolicy,
    });
    expect(result).toEqual([]);
  });

  test('should handle policy with no partyRoles array', () => {
    const policyWithoutPartyRoles: Policy = {
      policyNumber: 'POL456',
      // No partyRoles property
    };
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: 'PARTY001',
      policy: policyWithoutPartyRoles,
    });
    expect(result).toEqual([]);
  });

  test('should handle policy with empty partyRoles array', () => {
    const policyWithEmptyPartyRoles: Policy = {
      policyNumber: 'POL789',
      partyRoles: [],
    };
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: 'PARTY001',
      policy: policyWithEmptyPartyRoles,
    });
    expect(result).toEqual([]);
  });

  test('should handle undefined policyPartyId', () => {
    const result = getPartyRolesFromPolicyPartyId({
      policyPartyId: undefined as unknown as string,
      policy: mockPolicy,
    });
    expect(result).toEqual([]);
  });
});
