import { cleanup } from '@testing-library/react';

import {
    DASHBOARD_DEFAULT_LABEL,
    DASHBOARD_REPLACE_LABELS,
    dashboardChartTitleFormat,
    getLabelSubString,
    sortAlphabetically,
    splitAndSentenceCase,
} from './dashboard-helpers';

describe('helpers/dashboard-helpers', () => {
    afterEach(() => cleanup());

    describe('sortAlphabetically', () => {
        it('sorts plain strings case-insensitively', () => {
            const arr = ['banana', 'Apple', 'apple', 'Banana'];
            const sorted = [...arr].sort((a, b) => sortAlphabetically(a, b));
            expect(sorted).toEqual(['Apple', 'apple', 'banana', 'Banana']);
        });

        it('sorts objects by provided key', () => {
            const arr = [{ name: 'zeta' }, { name: 'Alpha' }, { name: 'beta' }];
            const sorted = [...arr].sort((a, b) =>
                sortAlphabetically(a, b, 'name')
            );
            expect(sorted.map((o) => o.name)).toEqual([
                'Alpha',
                'beta',
                'zeta',
            ]);
        });

        it('returns 0 when values are equal', () => {
            expect(sortAlphabetically('A', 'A')).toBe(0);
        });

        it('handles missing key gracefully (returns 0 when comparable value is undefined)', () => {
            const a = { other: 'x' } as any;
            const b = { name: undefined } as any;
            const res = sortAlphabetically(a, b, 'name');
            expect(res).toBe(0);
        });
    });

    describe('dashboardChartTitleFormat', () => {
        it('returns default label for falsy or replacement values', () => {
            for (const v of DASHBOARD_REPLACE_LABELS as any) {
                expect(dashboardChartTitleFormat(v)).toBe(
                    DASHBOARD_DEFAULT_LABEL
                );
            }
            // explicit empty string
            expect(dashboardChartTitleFormat('')).toBe(DASHBOARD_DEFAULT_LABEL);
        });

        it('replaces underscores, title-cases, and NIGO substitutions (singular/plural)', () => {
            expect(dashboardChartTitleFormat('pending_exceptions')).toBe(
                'Pending NIGOs'
            );
            expect(dashboardChartTitleFormat('exception')).toBe('NIGO');
            expect(dashboardChartTitleFormat('EXCEPTIONS')).toBe('NIGOs');
        });

        it('applies substring when length is a number', () => {
            const label = 'really long label for a chart title';
            const formatted = dashboardChartTitleFormat(label, 6);
            // toTitleCase mocked, so first word capitalized
            expect(formatted).toBe('Really...');
        });

        it('applies default substring length when length is true', () => {
            const base = 'abcde fghij klmno pqrst uvwxy z';
            const formatted = dashboardChartTitleFormat(base, true);
            // default 25
            expect(formatted.endsWith('...')).toBe(true);
            expect(formatted.length).toBe(28); // 25 + '...'
        });

        it('does not substring when length is false', () => {
            const base = 'a_simple_label';
            const formatted = dashboardChartTitleFormat(base, false);
            expect(formatted).toBe('A Simple Label');
        });
    });

    describe('getLabelSubString', () => {
        it('returns empty string for falsy label', () => {
            expect(getLabelSubString(undefined as any)).toBe('');
        });

        it('returns label untouched when length is false', () => {
            expect(getLabelSubString('Example', false)).toBe('Example');
        });

        it('uses default 25 when length is true', () => {
            const lbl = 'abcdefghijklmnopqrstuvwxyz';
            expect(getLabelSubString(lbl, true)).toBe(
                'abcdefghijklmnopqrstuvwxy...'
            );
        });

        it('substrings when exceeding length', () => {
            expect(getLabelSubString('HelloWorld', 5)).toBe('Hello...');
        });
    });

    describe('oneYearAgoISO', () => {
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
        });
        afterAll(() => jest.useRealTimers());

        it('represents current time minus one year in ISO', () => {
            jest.isolateModules(() => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { oneYearAgoISO: value } = require('./dashboard-helpers');
                expect(value.startsWith('2023-06-')).toBe(true);
                expect(value.endsWith('Z')).toBe(true);
            });
        });
    });

    describe('splitAndSentenceCase', () => {
        it('splits camel/pascal case and lowercases following characters', () => {
            expect(splitAndSentenceCase('camelCaseValue')).toBe(
                'Camel case value'
            );
            expect(splitAndSentenceCase('PascalCaseValue')).toBe(
                'Pascal case value'
            );
        });

        it('handles single word inputs', () => {
            expect(splitAndSentenceCase('single')).toBe('Single');
            // All-caps will introduce spaces before each uppercase letter
            expect(splitAndSentenceCase('SINGLE')).toBe('S i n g l e');
        });
    });
});
