import dayjs from 'dayjs';

import {
    formatTaskTime,
    isValidDate,
    startOfTomorrowLocalIso,
    standardDateMonthDayYear,
    toEnterpriseDate,
    ENTERPRISE_DATE_FORMAT,
} from './dates';
import { DEFAULT_ERROR_STRING } from './strings';

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

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
describe('startOfTomorrowLocalIso', () => {
    it('returns UTC ISO for local midnight of the next day', () => {
        const input = '2025-09-08';
        const expected = dayjs(input, ENTERPRISE_DATE_FORMAT, true)
            .add(1, 'day')
            .startOf('day')
            .toDate()
            .toISOString();

        expect(startOfTomorrowLocalIso(input)).toBe(expected);
    });

    it('handles month/year rollovers', () => {
        const input1 = '2025-12-31';
        const expected1 = dayjs(input1, ENTERPRISE_DATE_FORMAT, true)
            .add(1, 'day')
            .startOf('day')
            .toDate()
            .toISOString();
        expect(startOfTomorrowLocalIso(input1)).toBe(expected1);

        const input2 = '2025-01-31';
        const expected2 = dayjs(input2, ENTERPRISE_DATE_FORMAT, true)
            .add(1, 'day')
            .startOf('day')
            .toDate()
            .toISOString();
        expect(startOfTomorrowLocalIso(input2)).toBe(expected2);
    });

    it('returns DEFAULT_ERROR_STRING for invalid input', () => {
        expect(startOfTomorrowLocalIso('')).toBe(DEFAULT_ERROR_STRING);
    });
});

describe('formatTaskTime', () => {
    const t = jest
        .fn()
        .mockImplementation((key: string) => key.replace(/allFields\./, ''));

    it('formats 30 minutes correctly', () => {
        expect(formatTaskTime(30 * ONE_MINUTE, t)).toBe('30 minutes');
    });

    it('formats exactly 1 minute', () => {
        expect(formatTaskTime(1 * ONE_MINUTE, t)).toBe('1 minute');
    });

    it('formats 3599 seconds to 1 hour', () => {
        expect(formatTaskTime(3599, t)).toBe('1 hour');
    });

    it('formats 59 minutes correctly', () => {
        expect(formatTaskTime(59 * ONE_MINUTE, t)).toBe('59 minutes');
    });

    it('formats fractionals hours (2.5h)', () => {
        expect(formatTaskTime(2.5 * ONE_HOUR, t)).toBe('2.5 hours');
    });

    it('formats exactly 1 day', () => {
        expect(formatTaskTime(1 * ONE_DAY, t)).toBe('1 day');
    });

    it('formats 86399 seconds to 1 days', () => {
        expect(formatTaskTime(86399, t)).toBe('1 day');
    });

    it('formats exactly (1.5 d)', () => {
        expect(formatTaskTime(1.5 * ONE_DAY, t)).toBe('1.5 days');
    });

    it('formats 0ms as 0 minutes', () => {
        expect(formatTaskTime(0, t)).toBe('0 minutes');
    });
});
