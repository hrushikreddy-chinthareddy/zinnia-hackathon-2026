import dayjs from 'dayjs';

import {
    ActiveAgingTimeRange,
    calculateEndDate,
    generateActiveAgingCategories,
    generateActiveAgingSeries,
    getFormattedDateRange,
    isBetweenTimeRange,
    organizeAndMergeDataByTimeRange,
    startDates,
} from '@deps/components/dashboard/sections/active-aging/utils';

import { friendlyDateFormat } from '../../utils';

describe('Active Aging Utils', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date());
    });
    describe('isBetweenTimeRange', () => {
        it('should return true for dates within the given time range', () => {
            const today = dayjs();
            const date = today.subtract(3, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.ZERO_TO_SIX
                )
            ).toBe(true);
        });

        it('should return false for dates outside the given time range', () => {
            const today = dayjs();
            const date = today.subtract(7, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.ZERO_TO_SIX
                )
            ).toBe(false);
        });

        it('should return true for dates within the 7-13 time range', () => {
            const today = dayjs();
            const date = today.subtract(10, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.SEVEN_TO_THIRTEEN
                )
            ).toBe(true);
        });

        it('should return false for dates outside the 7-13 time range', () => {
            const today = dayjs();
            const date = today.subtract(14, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.SEVEN_TO_THIRTEEN
                )
            ).toBe(false);
        });

        it('should return true for dates within the 14-27 time range', () => {
            const today = dayjs();
            const date = today.subtract(20, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN
                )
            ).toBe(true);
        });

        it('should return false for dates outside the 14-27 time range', () => {
            const today = dayjs();
            const date = today.subtract(28, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN
                )
            ).toBe(false);
        });

        it('should return true for dates within the 28+ time range', () => {
            const today = dayjs();
            const date = today.subtract(30, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.TWENTY_EIGHT_PLUS
                )
            ).toBe(true);
        });

        it('should return false for dates outside the 28+ time range', () => {
            const today = dayjs();
            const date = today.add(1, 'day');
            expect(
                isBetweenTimeRange(
                    today,
                    date.format('YYYY-MM-DD'),
                    ActiveAgingTimeRange.TWENTY_EIGHT_PLUS
                )
            ).toBe(false);
        });
    });

    describe('organizeAndMergeDataByTimeRange', () => {
        it('should organize data by time range', () => {
            const today = dayjs();
            const data = [
                {
                    name: 'Test',
                    key: 'test',
                    count: 210,
                    values: [
                        { name: today.toString(), count: 10, key: '123' },
                        {
                            name: today.subtract(1, 'day').toString(),
                            count: 20,
                            key: '456',
                        },
                        {
                            name: today.subtract(2, 'day').toString(),
                            count: 30,
                            key: '789',
                        },
                        {
                            name: today.subtract(3, 'day').toString(),
                            count: 40,
                            key: '101',
                        },
                        {
                            name: today.subtract(7, 'day').toString(),
                            count: 50,
                            key: '102',
                        },
                        {
                            name: today.subtract(8, 'day').toString(),
                            count: 60,
                            key: '103',
                        },
                        {
                            name: today.subtract(15, 'day').toString(),
                            count: 70,
                            key: '104',
                        },
                        {
                            name: today.subtract(14, 'day').toString(),
                            count: 80,
                            key: '105',
                        },
                        {
                            name: today.subtract(18, 'day').toString(),
                            count: 90,
                            key: '106',
                        },
                    ],
                },
                {
                    name: 'Test 2',
                    key: 'test2',
                    count: 150,
                    values: [
                        {
                            name: today.toString(),
                            count: 10,
                            key: 'test-2-123',
                        },
                        {
                            name: today.subtract(1, 'day').toString(),
                            count: 20,
                            key: 'test-2-456',
                        },
                        {
                            name: today.subtract(2, 'day').toString(),
                            count: 30,
                            key: 'test-2-789',
                        },
                        {
                            name: today.subtract(3, 'day').toString(),
                            count: 40,
                            key: 'test-2-101',
                        },
                        {
                            name: today.subtract(7, 'day').toString(),
                            count: 50,
                            key: 'test-2-102',
                        },
                        {
                            name: today.subtract(8, 'day').toString(),
                            count: 60,
                            key: 'test-2-103',
                        },
                        {
                            name: today.subtract(15, 'day').toString(),
                            count: 70,
                            key: 'test-2-104',
                        },
                        {
                            name: today.subtract(14, 'day').toString(),
                            count: 80,
                            key: 'test-2-105',
                        },
                        {
                            name: today.subtract(18, 'day').toString(),
                            count: 90,
                            key: 'test-2-106',
                        },
                    ],
                },
            ];

            const result = organizeAndMergeDataByTimeRange(data);
            expect(result).toEqual({
                [ActiveAgingTimeRange.ZERO_TO_SIX]: {
                    countByDay: {},
                    data: [
                        {
                            countByDay: {
                                [today.toString()]: 10,
                                [today.subtract(1, 'day').toString()]: 20,
                                [today.subtract(2, 'day').toString()]: 30,
                                [today.subtract(3, 'day').toString()]: 40,
                            },
                            name: 'Test',
                            count: [10, 20, 30, 40],
                            total: 100,
                        },
                        {
                            countByDay: {
                                [today.toString()]: 10,
                                [today.subtract(1, 'day').toString()]: 20,
                                [today.subtract(2, 'day').toString()]: 30,
                                [today.subtract(3, 'day').toString()]: 40,
                            },
                            name: 'Test 2',
                            count: [10, 20, 30, 40],
                            total: 100,
                        },
                    ],
                    total: 200,
                },
                [ActiveAgingTimeRange.SEVEN_TO_THIRTEEN]: {
                    countByDay: {},
                    data: [
                        {
                            countByDay: {
                                [today.subtract(7, 'day').toString()]: 50,
                                [today.subtract(8, 'day').toString()]: 60,
                            },
                            name: 'Test',
                            count: [50, 60],
                            total: 110,
                        },
                        {
                            countByDay: {
                                [today.subtract(7, 'day').toString()]: 50,
                                [today.subtract(8, 'day').toString()]: 60,
                            },
                            name: 'Test 2',
                            count: [50, 60],
                            total: 110,
                        },
                    ],
                    total: 220,
                },
                [ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN]: {
                    countByDay: {},
                    data: [
                        {
                            countByDay: {
                                [today.subtract(15, 'day').toString()]: 70,
                                [today.subtract(14, 'day').toString()]: 80,
                                [today.subtract(18, 'day').toString()]: 90,
                            },
                            name: 'Test',
                            count: [70, 80, 90],
                            total: 240,
                        },
                        {
                            countByDay: {
                                [today.subtract(15, 'day').toString()]: 70,
                                [today.subtract(14, 'day').toString()]: 80,
                                [today.subtract(18, 'day').toString()]: 90,
                            },
                            name: 'Test 2',
                            count: [70, 80, 90],
                            total: 240,
                        },
                    ],
                    total: 480,
                },
                [ActiveAgingTimeRange.TWENTY_EIGHT_PLUS]: {
                    countByDay: {},
                    data: [],
                    total: 0,
                },
            });
        });
    });

    describe('generateActiveAgingCategories', () => {
        it('should generate categories for each time range', () => {
            expect(
                generateActiveAgingCategories(ActiveAgingTimeRange.ZERO_TO_SIX)
            ).toEqual([
                'Today',
                '1 Day',
                '2 Days',
                '3 Days',
                '4 Days',
                '5 Days',
                '6 Days',
            ]);

            expect(
                generateActiveAgingCategories(
                    ActiveAgingTimeRange.SEVEN_TO_THIRTEEN
                )
            ).toEqual([
                '7 Days',
                '8 Days',
                '9 Days',
                '10 Days',
                '11 Days',
                '12 Days',
                '13 Days',
            ]);

            expect(
                generateActiveAgingCategories(
                    ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN
                )
            ).toEqual([
                '14-15 Days',
                '16-17 Days',
                '18-19 Days',
                '20-21 Days',
                '22-23 Days',
                '24-25 days',
                '26-27 days',
            ]);

            expect(
                generateActiveAgingCategories(
                    ActiveAgingTimeRange.TWENTY_EIGHT_PLUS
                )
            ).toEqual([
                '28-37 Days',
                '38-47 Days',
                '48-57 Days',
                '58-67 Days',
                '68-77 Days',
                '78-87 Days',
                '88+ Days',
            ]);
        });
    });

    describe('generateActiveAgingSeries', () => {
        it('should generate series data for each time range', () => {
            const data = [
                {
                    name: 'Test',
                    count: [10, 20, 30],
                    createdAt: '2023-07-06',
                    countByDay: {
                        '2023-07-06': 10,
                        '2023-07-07': 20,
                        '2023-07-08': 30,
                    },
                    total: 60,
                },
            ];

            const result = generateActiveAgingSeries(
                ActiveAgingTimeRange.ZERO_TO_SIX,
                {
                    [ActiveAgingTimeRange.ZERO_TO_SIX]: { data, total: 60 },
                    [ActiveAgingTimeRange.SEVEN_TO_THIRTEEN]: {
                        data: [],
                        total: 0,
                    },
                    [ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN]: {
                        data: [],
                        total: 0,
                    },
                    [ActiveAgingTimeRange.TWENTY_EIGHT_PLUS]: {
                        data: [],
                        total: 0,
                    },
                }
            );

            expect(result).toEqual([
                {
                    name: 'Test',
                    type: 'column',
                    data: [30, 20, 10],
                },
            ]);
        });
    });

    describe('getFormattedDateRange', () => {
        it('should format date ranges', () => {
            const to = dayjs().format(friendlyDateFormat);
            const from = dayjs().subtract(6, 'day').format(friendlyDateFormat);

            const formattedDateRange = getFormattedDateRange(
                ActiveAgingTimeRange.ZERO_TO_SIX
            );

            expect(formattedDateRange.from).toBe(from);
            expect(formattedDateRange.to).toBe(to);
        });
    });

    describe('calculateEndDate', () => {
        it('should calculate end dates', () => {
            expect(calculateEndDate(ActiveAgingTimeRange.ZERO_TO_SIX)).toBe(
                dayjs().format(friendlyDateFormat)
            );
        });
    });

    describe('startDates', () => {
        it('should return start dates for each time range', () => {
            expect(startDates).toEqual({
                [ActiveAgingTimeRange.ZERO_TO_SIX]: dayjs()
                    .subtract(6, 'day')
                    .format(friendlyDateFormat),
                [ActiveAgingTimeRange.SEVEN_TO_THIRTEEN]: dayjs()
                    .subtract(13, 'day')
                    .format(friendlyDateFormat),
                [ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN]: dayjs()
                    .subtract(27, 'day')
                    .format(friendlyDateFormat),
                [ActiveAgingTimeRange.TWENTY_EIGHT_PLUS]: dayjs()
                    .subtract(1, 'year')
                    .format(friendlyDateFormat),
            });
        });
    });
});
