import { calculateAgeNumber } from './age.helpers';

describe('calculateAgeNumber', () => {
    // Mock the current date for consistent testing
    const MOCK_CURRENT_DATE = '2026-03-17';

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(`${MOCK_CURRENT_DATE}T12:00:00`));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('input validation', () => {
        it('should return undefined for undefined input', () => {
            expect(calculateAgeNumber(undefined)).toBeUndefined();
        });

        it('should return undefined for null input', () => {
            expect(calculateAgeNumber(null)).toBeUndefined();
        });

        it('should return undefined for empty string', () => {
            expect(calculateAgeNumber('')).toBeUndefined();
        });

        it('should return undefined for invalid date string', () => {
            expect(calculateAgeNumber('invalid-date')).toBeUndefined();
        });

        it('should handle date string with slash separator (dayjs lenient parsing)', () => {
            // Note: dayjs does lenient parsing, so 2000/01/01 is accepted
            expect(calculateAgeNumber('2000/01/01')).toBe(26);
        });

        it('should return undefined for invalid Date object', () => {
            expect(calculateAgeNumber(new Date('invalid'))).toBeUndefined();
        });
    });

    describe('string input (YYYY-MM-DD format)', () => {
        it('should calculate age correctly for a valid date string', () => {
            // Person born on 2000-03-17, today is 2026-03-17 = 26 years old
            expect(calculateAgeNumber('2000-03-17')).toBe(26);
        });

        it('should calculate age correctly when birthday has not occurred this year', () => {
            // Person born on 2000-12-25, today is 2026-03-17 = still 25 years old
            expect(calculateAgeNumber('2000-12-25')).toBe(25);
        });

        it('should calculate age correctly when birthday has already occurred this year', () => {
            // Person born on 2000-01-01, today is 2026-03-17 = 26 years old
            expect(calculateAgeNumber('2000-01-01')).toBe(26);
        });

        it('should return 0 for someone born this year', () => {
            expect(calculateAgeNumber('2026-01-01')).toBe(0);
        });

        it('should handle leap year birthdays', () => {
            // Person born on Feb 29, 2000 (leap year)
            expect(calculateAgeNumber('2000-02-29')).toBe(26);
        });
    });

    describe('Date object input', () => {
        it('should calculate age correctly for a valid Date object', () => {
            const birthday = new Date('2000-03-17T12:00:00');
            expect(calculateAgeNumber(birthday)).toBe(26);
        });

        it('should calculate age correctly when birthday has not occurred this year', () => {
            const birthday = new Date('2000-12-25T12:00:00');
            expect(calculateAgeNumber(birthday)).toBe(25);
        });

        it('should calculate age correctly when birthday has already occurred this year', () => {
            const birthday = new Date('2000-01-01T12:00:00');
            expect(calculateAgeNumber(birthday)).toBe(26);
        });

        it('should handle Date object created at midnight', () => {
            // This was the original bug - midnight dates could shift due to timezone
            const birthday = new Date('2000-01-01T00:00:00');
            expect(calculateAgeNumber(birthday)).toBe(26);
        });

        it('should handle Date object with noon time (our fix)', () => {
            const birthday = new Date('2000-01-01T12:00:00');
            expect(calculateAgeNumber(birthday)).toBe(26);
        });
    });

    describe('timezone edge cases', () => {
        it('should handle the original bug scenario: Jan 1 birthday at midnight UTC', () => {
            // This is the exact scenario from the bug report
            // Date stored as 2000-01-01T00:00:00.000+00:00 in MongoDB
            // After parseClientCase fix, it becomes a Date at noon local time
            const birthday = new Date('2000-01-01T12:00:00');
            expect(calculateAgeNumber(birthday)).toBe(26);
        });

        it('should handle year boundary dates (Dec 31)', () => {
            const birthday = new Date('1999-12-31T12:00:00');
            expect(calculateAgeNumber(birthday)).toBe(26);
        });

        it('should handle month boundary dates (first of month)', () => {
            const birthday = new Date('2000-03-01T12:00:00');
            expect(calculateAgeNumber(birthday)).toBe(26);
        });
    });

    describe('age calculation accuracy', () => {
        it('should return exact age on birthday', () => {
            // Today is 2026-03-17, person born on 2000-03-17
            expect(calculateAgeNumber('2000-03-17')).toBe(26);
        });

        it('should return age minus one day before birthday', () => {
            // Today is 2026-03-17, person born on 2000-03-18 = still 25
            expect(calculateAgeNumber('2000-03-18')).toBe(25);
        });

        it('should return correct age day after birthday', () => {
            // Today is 2026-03-17, person born on 2000-03-16 = 26
            expect(calculateAgeNumber('2000-03-16')).toBe(26);
        });

        it('should handle very old dates', () => {
            expect(calculateAgeNumber('1926-03-17')).toBe(100);
        });

        it('should handle recent dates', () => {
            expect(calculateAgeNumber('2025-03-17')).toBe(1);
        });
    });

    describe('real-world scenarios', () => {
        it('should calculate correct age for typical insurance customer (middle-aged)', () => {
            expect(calculateAgeNumber('1980-06-15')).toBe(45);
        });

        it('should calculate correct age for elderly customer', () => {
            expect(calculateAgeNumber('1950-01-01')).toBe(76);
        });

        it('should calculate correct age for young adult', () => {
            expect(calculateAgeNumber('2005-08-20')).toBe(20);
        });

        it('should calculate correct age for minor', () => {
            expect(calculateAgeNumber('2015-03-17')).toBe(11);
        });

        it('should calculate correct age for newborn', () => {
            expect(calculateAgeNumber('2026-03-01')).toBe(0);
        });
    });

    describe('consistency between string and Date inputs', () => {
        it('should return same age for equivalent string and Date inputs', () => {
            const dateString = '2000-06-15';
            const dateObject = new Date('2000-06-15T12:00:00');

            expect(calculateAgeNumber(dateString)).toBe(
                calculateAgeNumber(dateObject)
            );
        });

        it('should return same age for Jan 1 as string and Date', () => {
            const dateString = '2000-01-01';
            const dateObject = new Date('2000-01-01T12:00:00');

            expect(calculateAgeNumber(dateString)).toBe(
                calculateAgeNumber(dateObject)
            );
        });

        it('should return same age for Dec 31 as string and Date', () => {
            const dateString = '1999-12-31';
            const dateObject = new Date('1999-12-31T12:00:00');

            expect(calculateAgeNumber(dateString)).toBe(
                calculateAgeNumber(dateObject)
            );
        });
    });

    describe('edge cases for date format validation', () => {
        // Note: dayjs does lenient parsing even with a format string specified,
        // so some "invalid" formats are still accepted. These tests document
        // the actual behavior rather than strict format validation.

        it('should handle date with slash separator (dayjs lenient parsing)', () => {
            // dayjs accepts this format even though we specify YYYY-MM-DD
            expect(calculateAgeNumber('2000/03/17')).toBe(26);
        });

        it('should reject date with wrong order (DD-MM-YYYY)', () => {
            // 17-03-2000 is rejected because dayjs can't parse it meaningfully
            expect(calculateAgeNumber('17-03-2000')).toBeUndefined();
        });

        it('should handle date with wrong order (MM-DD-YYYY) via lenient parsing', () => {
            // dayjs parses 03-17-2000 leniently, interpreting it as a date
            expect(calculateAgeNumber('03-17-2000')).toBe(26);
        });

        it('should handle ISO datetime string with time component', () => {
            // dayjs accepts full ISO strings even when format is specified
            const result = calculateAgeNumber('2000-03-17T00:00:00.000Z');
            expect(result).toBe(26);
        });

        it('should accept valid YYYY-MM-DD format', () => {
            expect(calculateAgeNumber('2000-03-17')).toBe(26);
        });
    });
});
