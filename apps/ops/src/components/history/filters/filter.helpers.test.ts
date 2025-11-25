import {
    EventFilterKeys,
    EventFilters,
    PolicyFilters,
} from '@deps/contexts/HistoryFiltersContext';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    filterEventFilters,
    getFilter,
    getFilterEnumKey,
    getYearOptions,
    hasFilter,
} from './filter.helpers';

describe('HistoryFilters helpers', () => {
    describe('getYearOptions', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2022, 1, 1));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return an empty array if given an invalid date', () => {
            expect(getYearOptions('not-a-date')).toEqual([]);
        });

        it('should return expected options', () => {
            const expected = [
                { label: DEFAULT_ERROR_STRING, value: DEFAULT_ERROR_STRING },
                { label: '2022', value: '2022' },
                { label: '2021', value: '2021' },
                { label: '2020', value: '2020' },
                { label: '2019', value: '2019' },
            ];

            expect(getYearOptions('2019-10-03')).toEqual(expected);
            expect(getYearOptions('2019')).toEqual(expected);
            expect(getYearOptions('2019').length).toEqual(expected.length);
        });
    });

    describe('hasFilter', () => {
        it('returns true if the filter is not null, empty, or undefined', () => {
            expect(hasFilter('someFilter')).toBe(true);
            expect(hasFilter('')).toBe(false);
            expect(hasFilter(null)).toBe(false);
            expect(hasFilter(undefined)).toBe(false);
        });
    });

    describe('getFilter', () => {
        it('returns the filter and subfilter names if a filter is present', () => {
            const eventFilter = {
                [EventFilterKeys.Policy]: PolicyFilters.Anniversary,
            };

            expect(getFilter(eventFilter)).toEqual({
                filterName: 'policy',
                subfilterName: 'anniversary',
            });
        });

        it('returns undefined for filter and subfilter names if no filter is present', () => {
            const eventFilter = undefined;

            expect(getFilter(eventFilter)).toEqual({
                filterName: undefined,
                subfilterName: undefined,
            });
        });
    });

    describe('getFilterEnumKey', () => {
        it('finds the correct parent enum property', () => {
            const result = getFilterEnumKey('address');
            expect(result).toBe('people');
        });

        it('returns EventFilterKeys.All when it can NOT find a parent enum value', () => {
            const result = getFilterEnumKey('yolo');
            expect(result).toBe('all');
        });
    });

    describe('filterEventFilters', () => {
        it('adds a new EventFilterKey and sets value to an array', () => {
            const args = {
                state: {},
                filterKey: EventFilterKeys.People,
                filter: 'address',
            };
            const result = filterEventFilters(
                args.state as EventFilters,
                args.filterKey,
                args.filter
            );
            console.log(result);
            expect(result).toStrictEqual({ people: ['address'] });
        });

        it('filters out the EventFilterKey', () => {
            const args = {
                state: { people: ['address'] } as any,
                filterKey: EventFilterKeys.People,
                filter: 'address',
            };
            const result = filterEventFilters(
                args.state,
                args.filterKey,
                args.filter
            );
            console.log(result);
            expect(result).toStrictEqual({});
        });

        it('add new value to the EventFilterKey array', () => {
            const args = {
                state: { people: ['address'] } as any,
                filterKey: EventFilterKeys.People,
                filter: 'phone',
            };
            const result = filterEventFilters(
                args.state,
                args.filterKey,
                args.filter
            );
            console.log(result);
            expect(result).toStrictEqual({ people: ['address', 'phone'] });
        });
    });
});
