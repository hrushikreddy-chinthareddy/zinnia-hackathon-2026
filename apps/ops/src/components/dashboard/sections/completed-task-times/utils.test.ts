import {
    getCarrierName,
    flattenCompletedTaskTimeData,
    generateTasksCSVFilename,
    CompletedTaskTimeData,
    formatTaskTime,
} from './utils';

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

// Mock the defaultDateFormat
jest.mock('@deps/components/dashboard/utils', () => ({
    defaultDateFormat: 'MMM D, YYYY',
}));

describe('Completed Task Time Utils', () => {
    describe('getCarrierName', () => {
        it('should return "All Carriers" when no carriers selected', () => {
            expect(getCarrierName({})).toBe('All Carriers');
        });

        it('should return carrier name when one carrier selected', () => {
            expect(getCarrierName({ carrier1: 'Pacific Life' })).toBe(
                'Pacific Life'
            );
        });

        it('should return "All Carriers" when multiple carriers selected', () => {
            const carriers = {
                carrier1: 'Pacific Life',
                carrier2: 'MetLife',
            };
            expect(getCarrierName(carriers)).toBe('All Carriers');
        });
    });

    describe('formatTaskTime', () => {
        it('formats 30 minutes correctly', () => {
            expect(formatTaskTime(30 * ONE_MINUTE)).toBe('30 minutes');
        });

        it('formats exactly 1 minute', () => {
            expect(formatTaskTime(1 * ONE_MINUTE)).toBe('1 minute');
        });

        it('formats fractionals hours (2.5h)', () => {
            expect(formatTaskTime(2.5 * ONE_HOUR)).toBe('2.5 hours');
        });

        it('formats exactly 1 day', () => {
            expect(formatTaskTime(1 * ONE_DAY)).toBe('1 day');
        });

        it('formats exactly (1.5 d)', () => {
            expect(formatTaskTime(1.5 * ONE_DAY)).toBe('1.5 days');
        });

        it('formats 0ms as 0 minutes', () => {
            expect(formatTaskTime(0)).toBe('0 minutes');
        });
    });

    describe('flattenCompletedTaskTimeData', () => {
        it('should return empty array for undefined or empty input', () => {
            expect(flattenCompletedTaskTimeData(undefined)).toEqual([]);
            expect(flattenCompletedTaskTimeData([])).toEqual([]);
        });

        it('should flatten single case type with tasks', () => {
            const input: CompletedTaskTimeData[] = [
                {
                    caseType: 'New Business',
                    secondMedian: 1896000,
                    secondHigh: 423360000,
                    secondLow: 216000,
                    tasks: [
                        {
                            secondMedian: 1800000,
                            secondHigh: 423360000,
                            secondLow: 216000,
                            taskName: 'Data Entry',
                            count: 100,
                        },
                        {
                            secondMedian: 1200000,
                            secondHigh: 345600000,
                            secondLow: 180000,
                            taskName: 'Review',
                            count: 50,
                        },
                    ],
                    totalTasks: 150,
                },
            ];

            const result = flattenCompletedTaskTimeData(input);

            expect(result).toEqual([
                {
                    caseType: 'New Business',
                    secondMedian: 1896000,
                    secondHigh: 423360000,
                    secondLow: 216000,
                    taskName: 'All tasks',
                    count: 150,
                },
                {
                    caseType: 'New Business',
                    secondMedian: 1800000,
                    secondHigh: 423360000,
                    secondLow: 216000,
                    taskName: 'Data Entry',
                    count: 100,
                },
                {
                    caseType: 'New Business',
                    secondMedian: 1200000,
                    secondHigh: 345600000,
                    secondLow: 180000,
                    taskName: 'Review',
                    count: 50,
                },
            ]);
        });

        it('should flatten multiple case types with tasks', () => {
            const input: CompletedTaskTimeData[] = [
                {
                    caseType: 'New Business',
                    secondMedian: 1896000,
                    secondHigh: 423360000,
                    secondLow: 216000,
                    tasks: [
                        {
                            secondMedian: 1896000,
                            secondHigh: 423360000,
                            secondLow: 216000,
                            taskName: 'Data Entry',
                            count: 100,
                        },
                    ],
                    totalTasks: 100,
                },
                {
                    caseType: 'Claims',
                    secondMedian: 2400000,
                    secondHigh: 432000000,
                    secondLow: 240000,
                    tasks: [
                        {
                            secondMedian: 2400000,
                            secondHigh: 432000000,
                            secondLow: 240000,
                            taskName: 'Review',
                            count: 50,
                        },
                    ],
                    totalTasks: 50,
                },
            ];

            const result = flattenCompletedTaskTimeData(input);

            expect(result).toHaveLength(4); // 2 "All tasks" + 2 individual tasks
            expect(result[0]).toEqual({
                caseType: 'New Business',
                secondMedian: 1896000,
                secondHigh: 423360000,
                secondLow: 216000,
                taskName: 'All tasks',
                count: 100,
            });
            expect(result[2]).toEqual({
                caseType: 'Claims',
                secondMedian: 2400000,
                secondHigh: 432000000,
                secondLow: 240000,
                taskName: 'All tasks',
                count: 50,
            });
        });
    });

    describe('generateTasksCSVFilename', () => {
        it('should generate correct filename format', () => {
            const result = generateTasksCSVFilename('Pacific Life', {
                from: '2024-06-01',
                to: '2024-06-30',
            });

            expect(result).toBe(
                'Pacific Life Median Task Processing Times Jun 1, 2024 to Jun 30, 2024.csv'
            );
        });

        it('should handle different status values', () => {
            expect(
                generateTasksCSVFilename('All Carriers', {
                    from: '2024-01-01',
                    to: '2024-12-31',
                })
            ).toContain('All Carriers Median Task Processing Times');

            expect(
                generateTasksCSVFilename('MetLife', {
                    from: '2024-01-01',
                    to: '2024-03-31',
                })
            ).toContain('MetLife Median Task Processing Times');
        });
    });
});
