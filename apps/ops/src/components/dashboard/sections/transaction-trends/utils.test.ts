import dayjs from 'dayjs';

import { DashboardResponseData } from '@deps/queries/api/dashboard';

import { generateSeries, groupDataByWeek, colors } from './utils';

describe('Utils Functions', () => {
    beforeEach(() => {
        const time = dayjs('2025-03-01');
        jest.useFakeTimers();
        jest.setSystemTime(time.toDate());
    });
    describe('generateSeries', () => {
        describe('generateSeries', () => {
            it('should generate series correctly for LastMonth timeframe', () => {
                const timerange = {
                    from: '2025-03-01',
                    to: '2025-03-31',
                };
                const data: DashboardResponseData[] = [
                    {
                        key: 'carrier',
                        name: 'Test Carrier',
                        count: 100,
                        values: [
                            { key: '1', name: '2025-03-01', count: 10 },
                            { key: '2', name: '2025-03-02', count: 50 },
                            { key: '3', name: '2025-03-08', count: 20 },
                            { key: '4', name: '2025-03-15', count: 30 },
                            { key: '5', name: '2025-03-22', count: 40 },
                        ],
                    },
                ];
                const result = generateSeries(data, timerange);
                const groupedData = groupDataByWeek(data[0].values || []);

                expect(result).toEqual([
                    {
                        type: 'line',
                        name: 'Test Carrier',
                        color: colors[0],
                        data: groupedData?.map((item) => [
                            dayjs(item.name).unix() * 1000,
                            item.count,
                        ]),
                    },
                ]);
            });
        });
    });

    describe('groupDataByWeek', () => {
        it('should group data by week correctly', () => {
            const data: DashboardResponseData[] = [
                { key: '1', name: '2023-04-01', count: 5 },
                { key: '2', name: '2023-04-02', count: 7 },
                { key: '3', name: '2023-04-08', count: 15 },
            ];
            const result = groupDataByWeek(data);

            expect(result).toEqual([
                { key: '2', name: '2023-03-30', count: 12 },
                { key: '3', name: '2023-04-06', count: 15 },
            ]);
        });
    });
});
