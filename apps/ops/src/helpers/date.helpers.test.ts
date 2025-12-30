import { cleanup } from '@testing-library/react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    convertToUserTimezone,
    getArrayIndexFromDate,
    getUtcDate,
    isCurrentDated,
    isCurrentStartDate,
    isEndDated,
} from './date.helpers';

// Ensure utc/timezone plugins are available in tests
dayjs.extend(utc);
dayjs.extend(timezone);

describe('helpers/date.helpers', () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.useRealTimers();
    });

    describe('isCurrentStartDate', () => {
        beforeEach(() => {
            jest.useFakeTimers({ now: new Date('2024-02-15T12:00:00Z') });
        });

        it('returns true when startDate is undefined and default flag is true', () => {
            expect(isCurrentStartDate(undefined)).toBe(true);
        });

        it('respects treatNoStartAsCurrent=false when startDate is undefined', () => {
            expect(isCurrentStartDate(undefined, false)).toBe(false);
        });

        it('returns true when startDate is after now (future-dated)', () => {
            expect(isCurrentStartDate('2024-03-01T00:00:00Z')).toBe(true);
        });

        it('returns false when startDate is before now (past-dated)', () => {
            expect(isCurrentStartDate('2024-02-01T00:00:00Z')).toBe(false);
        });
    });

    describe('isEndDated', () => {
        beforeEach(() => {
            jest.useFakeTimers({ now: new Date('2024-02-15T12:00:00Z') });
        });

        it('returns false when endDate is undefined', () => {
            expect(isEndDated(undefined)).toBe(false);
        });

        it('returns false when endDate is in the future', () => {
            expect(isEndDated('2024-03-01T00:00:00Z')).toBe(false);
        });

        it('returns true when endDate is in the past or now', () => {
            expect(isEndDated('2024-02-01T00:00:00Z')).toBe(true);
        });
    });

    describe('isCurrentDated', () => {
        beforeEach(() => {
            jest.useFakeTimers({ now: new Date('2024-02-15T12:00:00Z') });
        });

        it('returns true only when start is considered current and end is not end-dated', () => {
            const obj = {
                startDate: '2024-03-01T00:00:00Z',
                endDate: undefined,
            };
            expect(isCurrentDated(obj)).toBe(true);
        });

        it('returns false when start not considered current', () => {
            const obj = {
                startDate: '2024-01-01T00:00:00Z',
                endDate: undefined,
            };
            expect(isCurrentDated(obj)).toBe(false);
        });

        it('returns false when end is end-dated', () => {
            const obj = {
                startDate: '2024-03-01T00:00:00Z',
                endDate: '2024-02-01T00:00:00Z',
            };
            expect(isCurrentDated(obj)).toBe(false);
        });
    });

    describe('getArrayIndexFromDate', () => {
        it('computes day difference from start date, normalized to start of day', () => {
            expect(
                getArrayIndexFromDate('2024-02-12', '2024-02-10', 'day')
            ).toBe(2);
        });

        it('computes week difference from start date', () => {
            // From 2024-02-01 to 2024-02-22 is 3 weeks difference (rounded down)
            expect(
                getArrayIndexFromDate('2024-02-22', '2024-02-01', 'week')
            ).toBe(3);
        });

        it('computes month difference from start date', () => {
            expect(
                getArrayIndexFromDate('2024-03-01', '2024-01-01', 'month')
            ).toBe(2);
        });
    });

    describe('getUtcDate', () => {
        beforeEach(() => {
            jest.useFakeTimers({ now: new Date('2024-02-15T10:20:30Z') });
        });

        it('returns UTC formatted date with time components taken from current time', () => {
            const out = getUtcDate('2024-02-01', 'YYYY-MM-DD');
            const now = dayjs();
            const expected = dayjs('2024-02-01', 'YYYY-MM-DD')
                .set('hour', now.get('hour'))
                .set('minute', now.get('minute'))
                .set('second', now.get('second'))
                .utc()
                .format(ZAHARA_API_DATE_FORMAT);
            expect(out).toBe(expected);
        });

        it('handles a different input format', () => {
            const out = getUtcDate('02/01/2024', 'MM/DD/YYYY');
            const now = dayjs();
            const expected = dayjs('02/01/2024', 'MM/DD/YYYY')
                .set('hour', now.get('hour'))
                .set('minute', now.get('minute'))
                .set('second', now.get('second'))
                .utc()
                .format(ZAHARA_API_DATE_FORMAT);
            expect(out).toBe(expected);
        });
    });

    describe('convertToUserTimezone', () => {
        beforeEach(() => {
            jest.useFakeTimers({ now: new Date('2024-02-15T12:00:00Z') });
        });

        it('formats time in UTC when tz guess returns UTC', () => {
            const guessSpy = jest
                .spyOn(dayjs.tz as any, 'guess')
                .mockReturnValue('UTC');
            const out = convertToUserTimezone(
                '2024-02-15T12:00:00Z',
                'YYYY-MM-DD HH:mm:ss'
            );
            expect(out).toBe('2024-02-15 12:00:00 +00:00');
            guessSpy.mockRestore();
        });

        it('formats time in a specific timezone correctly', () => {
            const guessSpy = jest
                .spyOn(dayjs.tz as any, 'guess')
                .mockReturnValue('America/New_York');
            const out = convertToUserTimezone(
                '2024-02-15T12:00:00Z',
                'YYYY-MM-DD HH:mm:ss'
            );
            // New York is UTC-5 in February (standard time)
            expect(out.endsWith('-05:00')).toBe(true);
            expect(out.startsWith('2024-02-15 07:00:00')).toBe(true);
            guessSpy.mockRestore();
        });
    });
});
