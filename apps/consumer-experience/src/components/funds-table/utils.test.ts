import { sortNonHoldingFunds } from './utils';

describe('sortNonHoldingFunds', () => {
  // Returns an empty array when input is undefined
  it('should return an empty array when input is undefined', () => {
    const result = sortNonHoldingFunds(undefined);
    expect(result).toEqual([]);
  });

  it('should return an array of funds sorted by highest allocation percentage', () => {
    const result = sortNonHoldingFunds([
      {
        fundName: 'Fund A',
        totalFundValue: 100,
        allocationPercentage: 0.5,
      },
      {
        fundName: 'Fund B',
        totalFundValue: 200,
        allocationPercentage: 0.3,
      },
      {
        fundName: 'Fund C',
        totalFundValue: 300,
        allocationPercentage: 0.2,
      },
    ]);

    expect(result).toEqual([
      {
        fundName: 'Fund A',
        totalFundValue: 100,
        allocationPercentage: 0.5,
      },
      {
        fundName: 'Fund B',
        totalFundValue: 200,
        allocationPercentage: 0.3,
      },
      {
        fundName: 'Fund C',
        totalFundValue: 300,
        allocationPercentage: 0.2,
      },
    ]);
  });

  it('should return an array of funds sorted alphabetically when allocation percentage is 0', () => {
    const result = sortNonHoldingFunds([
      {
        fundName: 'Fund A',
        totalFundValue: 100,
        allocationPercentage: 0,
      },
      {
        fundName: 'Fund C',
        totalFundValue: 300,
        allocationPercentage: 0,
      },
      {
        fundName: 'Fund B',
        totalFundValue: 200,
        allocationPercentage: 0,
      },
    ]);

    expect(result).toEqual([
      {
        fundName: 'Fund A',
        totalFundValue: 100,
        allocationPercentage: 0,
      },
      {
        fundName: 'Fund B',
        totalFundValue: 200,
        allocationPercentage: 0,
      },
      {
        fundName: 'Fund C',
        totalFundValue: 300,
        allocationPercentage: 0,
      },
    ]);
  });

  it('should return an array of funds with elected funds first', () => {
    const result = sortNonHoldingFunds([
      {
        fundName: 'Fund A',
        totalFundValue: 100,
        allocationPercentage: 0,
        isElected: true,
      },
      {
        fundName: 'Fund C',
        totalFundValue: 300,
        allocationPercentage: 0,
        isElected: false,
      },
      {
        fundName: 'Fund B',
        totalFundValue: 200,
        allocationPercentage: 0,
        isElected: true,
      },
    ]);

    expect(result).toEqual([
      {
        fundName: 'Fund A',
        totalFundValue: 100,
        allocationPercentage: 0,
        isElected: true,
      },
      {
        fundName: 'Fund B',
        totalFundValue: 200,
        allocationPercentage: 0,
        isElected: true,
      },
      {
        fundName: 'Fund C',
        totalFundValue: 300,
        allocationPercentage: 0,
        isElected: false,
      },
    ]);
  });
});
