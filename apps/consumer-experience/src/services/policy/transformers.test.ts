import { Policy } from '@zinnia/api-types/types/sor';

import { transformPolicyForFundDetails } from './transformers';

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
