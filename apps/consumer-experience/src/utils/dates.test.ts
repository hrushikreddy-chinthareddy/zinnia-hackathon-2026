import { DEFAULT_ERROR_STRING } from '@zinnia/utils';

import {
  standardDateWithTimeEST,
  dayOfMonthWithOrdinal,
  standardDateMonthDayYear,
  sortByDate,
} from './dates';

describe('standardDateWithTimeEST', () => {
  it('should return a formatted date string with month, day, time, and timezone when given a valid date string', () => {
    const result = standardDateWithTimeEST('2023-06-12T17:00:00Z');
    expect(result).toBe('6/12/2023 1:00 pm EST');
  });

  it('should return an empty string when given an empty string', () => {
    const result = standardDateWithTimeEST('');
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return an empty string when given an invalid date string', () => {
    const result = standardDateWithTimeEST('invalid');
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return an empty string when given a null value', () => {
    const result = standardDateWithTimeEST(null);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });
});

describe('standardDateMonthDayYear', () => {
  it('should return a formatted date string when given a valid date string', () => {
    const date = '2024-02-26';
    const result = standardDateMonthDayYear(date);
    expect(result).toBe('2/26/2024');
  });

  it('should return an empty string when given an invalid date string', () => {
    const result = standardDateMonthDayYear('invalid');
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return an empty string when given a null value', () => {
    const result = standardDateMonthDayYear(null);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return an empty string when given an undefined value', () => {
    const result = standardDateMonthDayYear(undefined);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });
});

describe('dayOfMonthWithOrdinal', () => {
  // Should return the correct ordinal for a valid date string
  it('should return the correct ordinal for a valid date string', () => {
    const result = dayOfMonthWithOrdinal('2022-01-15');
    expect(result).toBe('15th');
  });

  // Should return the correct ordinal for the 1st day of the month
  it('should return the correct ordinal for the 1st day of the month', () => {
    const result = dayOfMonthWithOrdinal('2022-01-01');
    expect(result).toBe('1st');
  });

  // Should return default error string if arg is not a valid date
  it('should return the correct ordinal for the 1st day of the month', () => {
    const result = dayOfMonthWithOrdinal('test');
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });
});

describe('sortByDate', () => {
  // sorts dates in ascending order correctly
  it('should sort dates in ascending order when both dates are valid', () => {
    const date1 = '2023-01-01';
    const date2 = '2023-01-02';
    const result = sortByDate(date1, date2, { order: 'asc' });
    expect(result).toBe(-1);
  });

  // handles undefined values when both dates are undefined
  it('should return 0 when both dates are undefined', () => {
    const date1 = undefined;
    const date2 = undefined;
    const result = sortByDate(date1, date2, { order: 'asc' });
    expect(result).toBe(0);
  });

  // sorts dates in descending order correctly
  it('should sort dates in descending order when both dates are valid', () => {
    const date1 = '2023-01-01';
    const date2 = '2023-01-02';
    const result = sortByDate(date1, date2, { order: 'desc' });
    expect(result).toBe(1);
  });

  // handles null values when one date is null and order is ascending
  it('should handle null values when one date is null and order is ascending', () => {
    const date1 = null;
    const date2 = '2023-01-02';
    const result = sortByDate(date1, date2, { order: 'asc' });
    expect(result).toBe(1);
  });

  // handles invalid date strings
  it('should return -1 when one date is invalid and order is asc', () => {
    const validDate = '2023-01-01';
    const invalidDate = null;
    const result = sortByDate(invalidDate, validDate, { order: 'asc' });
    expect(result).toBe(-1);
  });
});
