import { DEFAULT_ERROR_STRING } from '@zinnia/utils';

import { dateMonthWithTimeEST, standardDateMonthYear } from './dates';

describe('dateMonthWithTimeEST', () => {
  it('should return a formatted date string with month, day, time, and timezone when given a valid date string', () => {
    const result = dateMonthWithTimeEST('2023-06-12T17:00:00Z');
    expect(result).toBe('6/12 1:00 pm EST');
  });

  it('should return an empty string when given an empty string', () => {
    const result = dateMonthWithTimeEST('');
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return an empty string when given an invalid date string', () => {
    const result = dateMonthWithTimeEST('invalid');
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return an empty string when given a null value', () => {
    const result = dateMonthWithTimeEST(null);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });
});

describe('standardDateMonthYear', () => {
  it('should return a formatted date string when given a valid date string', () => {
    const date = '2024-02-26';
    const result = standardDateMonthYear(date);
    expect(result).toBe('2/26/2024');
  });

  it('should return an empty string when given an invalid date string', () => {
    const result = standardDateMonthYear('invalid');
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return an empty string when given a null value', () => {
    const result = standardDateMonthYear(null);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });
});
