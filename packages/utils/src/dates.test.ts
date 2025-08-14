import { isValidDate } from './dates';
import { standardDateMonthDayYear } from './dates';
import { DEFAULT_ERROR_STRING } from './strings';
import dayjs from 'dayjs';
import { toEnterpriseDate, ENTERPRISE_DATE_FORMAT } from './dates';

describe('isValidDate', () => {
  it('should return true for a valid date string', () => {
    const date = '2022-01-01';
    expect(isValidDate(date)).toBe(true);
  });

  it('should return false for an invalid date string', () => {
    const date = 'invalid-date';
    expect(isValidDate(date)).toBe(false);
  });

  it('should return false for a null date', () => {
    const date = null;
    expect(isValidDate(date)).toBe(false);
  });

  it('should return false for an undefined date', () => {
    const date = undefined;
    expect(isValidDate(date)).toBe(false);
  });

  it('should return true for a Date object', () => {
    const date = new Date('2022-01-01');
    expect(isValidDate(date)).toBe(true);
  });
});

describe('standardDateMonthDayYear', () => {
  it('should return formatted date string when given a valid date string', () => {
    const date = '2024-02-26';
    const result = standardDateMonthDayYear(date);
    expect(result).toBe('2/26/2024');
  });

  it('should return formatted date string when given a valid Date object', () => {
    const date = new Date('2024-02-26T09:00:00');
    const result = standardDateMonthDayYear(date);
    expect(result).toBe('2/26/2024');
  });

  it('should return error string when given an invalid date string', () => {
    const date = 'invalid';
    const result = standardDateMonthDayYear(date);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return error string when given a null date', () => {
    const date = null;
    const result = standardDateMonthDayYear(date);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return error string when given an undefined date', () => {
    const date = undefined;
    const result = standardDateMonthDayYear(date);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });
});

describe('toEnterpriseDate', () => {
  it('should return formatted date for valid date string', () => {
    const date = '2022-01-01';
    const result = toEnterpriseDate(date);
    expect(result).toBe(dayjs(date).format(ENTERPRISE_DATE_FORMAT));
  });

  it('should return formatted date for valid Date object', () => {
    const date = new Date('2022-01-01');
    const result = toEnterpriseDate(date);
    expect(result).toBe(dayjs(date).format(ENTERPRISE_DATE_FORMAT));
  });

  it('should return error string for invalid date string', () => {
    const date = 'invalid-date';
    const result = toEnterpriseDate(date);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return error string for null date', () => {
    const date = null;
    const result = toEnterpriseDate(date);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });

  it('should return error string for undefined date', () => {
    const date = undefined;
    const result = toEnterpriseDate(date);
    expect(result).toBe(DEFAULT_ERROR_STRING);
  });
});
