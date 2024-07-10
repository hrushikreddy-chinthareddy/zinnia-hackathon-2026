import { Label } from '@zinnia/bloom/components';

import { calculateTotalDeposit } from './utils';

describe('calculateTotalDeposit', () => {
  // calculates total for positive values correctly
  it('should calculate total correctly when all values are positive', () => {
    const values = [
      { label: <Label>Submitted amount</Label>, value: 100 },
      { label: <Label>Fees</Label>, value: 200 },
      { label: <Label>Misc</Label>, value: 300 },
    ];
    const result = calculateTotalDeposit(values);
    expect(result).toBe(600);
  });

  // handles array with all zero values
  it('should return zero when all values are zero', () => {
    const values = [
      { label: <Label>Submitted amount</Label>, value: 100 },
      { label: <Label>Fees</Label>, value: 200 },
      { label: <Label>Misc</Label>, value: 300 },
    ];
    const result = calculateTotalDeposit(values);
    expect(result).toBe(0);
  });
});
