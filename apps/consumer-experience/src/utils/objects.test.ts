import { areAllValuesNull, returnNonNullValues } from './objects';

describe('areAllValuesNull', () => {
  it('should return true if all values in the object are null', () => {
    const obj = { a: null, b: null, c: null };
    expect(areAllValuesNull(obj)).toBe(true);
  });

  it('should return false if any value in the object is not null', () => {
    const obj = { a: null, b: undefined, c: null };
    expect(areAllValuesNull(obj)).toBe(false);
  });

  it('should return true for an empty object', () => {
    const obj = {};
    expect(areAllValuesNull(obj)).toBe(true);
  });
});

describe('returnNonNullValues', () => {
  it('should return an array of non-null values from the object', () => {
    const obj = { a: null, b: 1, c: null, d: 'hello' };
    expect(returnNonNullValues(obj)).toEqual([1, 'hello']);
  });

  it('should return an empty array for an object with only null values', () => {
    const obj = { a: null, b: null, c: null };
    expect(returnNonNullValues(obj)).toEqual([]);
  });

  it('should return an empty array for an empty object', () => {
    const obj = {};
    expect(returnNonNullValues(obj)).toEqual([]);
  });
});
