import { isNumber } from './regex';

describe('isNumber', () => {
  it('should return true for a string of only numbers', () => {
    expect(isNumber('123')).toBe(true);
    expect(isNumber('456789')).toBe(true);
  });

  it('should return false for a string with non-numeric characters', () => {
    expect(isNumber('abc')).toBe(false);
    expect(isNumber('123abc')).toBe(false);
    expect(isNumber('1.23')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isNumber('')).toBe(false);
  });
});
