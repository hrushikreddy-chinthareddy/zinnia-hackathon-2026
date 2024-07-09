import { calculateTotalDeposit } from './utils';

describe('calculateTotalDeposit', () => {
  // calculates total for positive values correctly
  it('should calculate total correctly when all values are positive', () => {
    const values = [
      { label: 'Deposit 1', value: 100 },
      { label: 'Deposit 2', value: 200 },
      { label: 'Deposit 3', value: 300 },
    ];
    const result = calculateTotalDeposit(values);
    expect(result).toBe(600);
  });

  // handles array with all zero values
  it('should return zero when all values are zero', () => {
    const values = [
      { label: 'Deposit 1', value: 0 },
      { label: 'Deposit 2', value: 0 },
      { label: 'Deposit 3', value: 0 },
    ];
    const result = calculateTotalDeposit(values);
    expect(result).toBe(0);
  });
});
