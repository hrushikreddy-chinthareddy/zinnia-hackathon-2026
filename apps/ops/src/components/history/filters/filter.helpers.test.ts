import { EventFilterKeys, initialFilter, PolicyFilters, TransactionFilters } from '@deps/contexts/HistoryFiltersContext';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    getYearOptions,
    hasFilter,
    getFilter,
    setFilter,
    setYearFilter,
    removeAllFilters,
    removeEventFilter,
    removeYearFilter,
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
                const eventFilter = { [EventFilterKeys.Policy]: PolicyFilters.Anniversary };

                expect(getFilter(eventFilter)).toEqual({ filterName: 'policy', subfilterName: 'anniversary' });
            });

            it('returns undefined for filter and subfilter names if no filter is present', () => {
                const eventFilter = undefined;

                expect(getFilter(eventFilter)).toEqual({ filterName: undefined, subfilterName: undefined });
            });
        });

        describe('setFilter', () => {
            it('sets the filter and subfilter in history filters', () => {
                let historyFilters = {};
                const setHistoryFilters = jest.fn().mockImplementation(callback => {
                    historyFilters = callback(historyFilters);
                });

                setFilter(setHistoryFilters, EventFilterKeys.Transactions, TransactionFilters.Premiums);

                expect(historyFilters).toEqual({
                    eventFilter: { transactions: 'premiums' },
                });
            });
        });

        describe('setYearFilter', () => {
            it('sets the year filter in history filters', () => {
                let historyFilters = {};
                const setHistoryFilters = jest.fn().mockImplementation(callback => {
                    historyFilters = callback(historyFilters);
                });

                setYearFilter(setHistoryFilters, '2022');

                expect(historyFilters).toEqual({
                    yearFilter: '2022',
                });
            });
        });

        describe('removeAllFilters', () => {
            it('removes all filters from history filters', () => {
                const setHistoryFilters = jest.fn();

                removeAllFilters(setHistoryFilters);

                expect(setHistoryFilters).toHaveBeenCalledWith(initialFilter);
            });
        });

        describe('removeEventFilter', () => {
            it('removes all subfilters from history filters', () => {
                let historyFilters = { eventFilter: { [EventFilterKeys.Policy]: PolicyFilters.Anniversary }, yearFilter: '2022' };
                const setHistoryFilters = jest.fn().mockImplementation(callback => {
                    historyFilters = callback(historyFilters);
                });

                removeEventFilter(setHistoryFilters);

                expect(historyFilters).toEqual({
                    yearFilter: '2022',
                });
            });
        });

        describe('removeYearFilter', () => {
            it('removes the year filter from history filters', () => {
                let historyFilters = { eventFilter: { [EventFilterKeys.Policy]: PolicyFilters.Anniversary }, yearFilter: '2022' };
                const setHistoryFilters = jest.fn().mockImplementation(callback => {
                    historyFilters = callback(historyFilters);
                });

                removeYearFilter(setHistoryFilters);

                expect(historyFilters).toEqual({
                    eventFilter: { policy: 'anniversary' },
                });
            });
        });
    });
});
