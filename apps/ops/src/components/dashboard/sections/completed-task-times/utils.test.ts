import { TFunction } from 'i18next';

import {
    getCarrierName,
    flattenCompletedTaskTimeData,
    generateTasksCSVFilename,
    CompletedTaskTimeData,
    formatTaskTimeFromArray,
} from './utils';

// Mock the defaultDateFormat
jest.mock('@deps/components/dashboard/utils', () => ({
    defaultDateFormat: 'MMM D, YYYY',
}));

describe('Completed Task Time Utils', () => {
    const TRANSLATIONS: Record<string, string> = {
        allCarriers: 'All Carriers',
    };

    const t = jest
        .fn()
        .mockImplementation(
            (key: string) => TRANSLATIONS[key.replace(/allFields\./, '')]
        );

    describe('getCarrierName', () => {
        it('should return "All Carriers" when no carriers selected', () => {
            expect(getCarrierName([], t)).toBe('All Carriers');
        });

        it('should return carrier name when one carrier selected', () => {
            expect(getCarrierName(['Pacific Life'], t)).toBe('Pacific Life');
        });

        it('should return "All Carriers" when multiple carriers selected', () => {
            const carriers = ['Pacific Life', 'MetLife'];
            expect(getCarrierName(carriers, t)).toBe('All Carriers');
        });
    });

    describe('formatTaskTimeFromArray', () => {
        const t = jest
            .fn()
            .mockImplementation((key: string) =>
                key.replace(/allFields\./, '')
            );

        it('formats a flattened completed task array', () => {
            const array = [
                {
                    caseType: 'New Business',
                    secondMedian: 1896,
                    taskName: 'All tasks',
                    count: 150,
                },
                {
                    caseType: 'New Business',
                    secondMedian: 1800,
                    taskName: 'Data Entry',
                    count: 100,
                },
            ];

            expect(formatTaskTimeFromArray(array, t)).toEqual([
                {
                    caseType: 'New Business',
                    secondMedian: '31.6 minutes',
                    taskName: 'All tasks',
                    count: 150,
                },
                {
                    caseType: 'New Business',
                    secondMedian: '30 minutes',
                    taskName: 'Data Entry',
                    count: 100,
                },
            ]);
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
                    tasks: [
                        {
                            secondMedian: 1800000,
                            taskName: 'Data Entry',
                            count: 100,
                        },
                        {
                            secondMedian: 1200000,
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
                    taskName: 'All tasks',
                    count: 150,
                },
                {
                    caseType: 'New Business',
                    secondMedian: 1800000,
                    taskName: 'Data Entry',
                    count: 100,
                },
                {
                    caseType: 'New Business',
                    secondMedian: 1200000,
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
                    tasks: [
                        {
                            secondMedian: 1896000,
                            taskName: 'Data Entry',
                            count: 100,
                        },
                    ],
                    totalTasks: 100,
                },
                {
                    caseType: 'Claims',
                    secondMedian: 2400000,
                    tasks: [
                        {
                            secondMedian: 2400000,
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
                taskName: 'All tasks',
                count: 100,
            });
            expect(result[2]).toEqual({
                caseType: 'Claims',
                secondMedian: 2400000,
                taskName: 'All tasks',
                count: 50,
            });
        });
    });

    describe('generateTasksCSVFilename', () => {
        const TRANSLATIONS: Record<string, string> = {
            'allFields.medianTaskProcessingTimesFilename':
                'Median Task Processing Times',
        };

        const tMock = jest.fn((key: string, opts?: Record<string, string>) =>
            opts
                ? `${opts?.carrierName} ${TRANSLATIONS[key]} ${opts.fromDate} to ${opts.toDate}`
                : ''
        ) as unknown as TFunction;

        it('should generate correct filename format', () => {
            const result = generateTasksCSVFilename(
                'Pacific Life',
                {
                    from: '2024-06-01',
                    to: '2024-06-30',
                },
                tMock
            );

            expect(result).toBe(
                'Pacific Life Median Task Processing Times Jun 1, 2024 to Jun 30, 2024.csv'
            );
        });

        it('should handle different status values', () => {
            expect(
                generateTasksCSVFilename(
                    'All Carriers',
                    {
                        from: '2024-01-01',
                        to: '2024-12-31',
                    },
                    tMock
                )
            ).toContain('All Carriers Median Task Processing Times');

            expect(
                generateTasksCSVFilename(
                    'MetLife',
                    {
                        from: '2024-01-01',
                        to: '2024-03-31',
                    },
                    tMock
                )
            ).toContain('MetLife Median Task Processing Times');
        });
    });
});
