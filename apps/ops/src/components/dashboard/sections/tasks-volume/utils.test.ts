import {
    getCarrierName,
    getStatusDisplayText,
    flattenTaskData,
    generateTasksCSVFilename,
    TaskStatus,
    TaskVolumeData,
} from './utils';

// Mock the defaultDateFormat
jest.mock('@deps/components/dashboard/utils', () => ({
    defaultDateFormat: 'MMM D, YYYY',
}));

describe('Tasks Volume Utils', () => {
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

    describe('getStatusDisplayText', () => {
        it('should return "All" when no statuses selected', () => {
            expect(getStatusDisplayText([])).toBe('All');
        });

        it('should return "Open" for open statuses', () => {
            expect(getStatusDisplayText([TaskStatus.OPEN])).toBe('Open');
            expect(getStatusDisplayText([TaskStatus.INPROGRESS])).toBe('Open');
            expect(
                getStatusDisplayText([TaskStatus.OPEN, TaskStatus.INPROGRESS])
            ).toBe('Open');
        });

        it('should return "Closed" for closed statuses', () => {
            expect(getStatusDisplayText([TaskStatus.CLOSED])).toBe('Closed');
            expect(
                getStatusDisplayText([
                    TaskStatus.COMPLETED,
                    TaskStatus.COMPLETE,
                ])
            ).toBe('Closed');
        });

        it('should return "Open-Closed" when both selected', () => {
            expect(
                getStatusDisplayText([TaskStatus.OPEN, TaskStatus.CLOSED])
            ).toBe('Open-Closed');
        });
    });

    describe('flattenTaskData', () => {
        it('should return empty array for undefined or empty input', () => {
            expect(flattenTaskData(undefined)).toEqual([]);
            expect(flattenTaskData([])).toEqual([]);
        });

        it('should flatten single case type with tasks', () => {
            const input: TaskVolumeData[] = [
                {
                    caseType: 'New Business',
                    tasks: [
                        { taskName: 'Data Entry', count: 100 },
                        { taskName: 'Review', count: 50 },
                    ],
                    totalTasks: 150,
                },
            ];

            const result = flattenTaskData(input);

            expect(result).toEqual([
                { caseType: 'New Business', taskName: 'All tasks', count: 150 },
                {
                    caseType: 'New Business',
                    taskName: 'Data Entry',
                    count: 100,
                },
                { caseType: 'New Business', taskName: 'Review', count: 50 },
            ]);
        });

        it('should flatten multiple case types with tasks', () => {
            const input: TaskVolumeData[] = [
                {
                    caseType: 'New Business',
                    tasks: [{ taskName: 'Data Entry', count: 100 }],
                    totalTasks: 100,
                },
                {
                    caseType: 'Claims',
                    tasks: [{ taskName: 'Review', count: 50 }],
                    totalTasks: 50,
                },
            ];

            const result = flattenTaskData(input);

            expect(result).toHaveLength(4); // 2 "All tasks" + 2 individual tasks
            expect(result[0]).toEqual({
                caseType: 'New Business',
                taskName: 'All tasks',
                count: 100,
            });
            expect(result[2]).toEqual({
                caseType: 'Claims',
                taskName: 'All tasks',
                count: 50,
            });
        });
    });

    describe('generateTasksCSVFilename', () => {
        it('should generate correct filename format', () => {
            const result = generateTasksCSVFilename('Pacific Life', 'Open', {
                from: '2024-06-01',
                to: '2024-06-30',
            });

            expect(result).toBe(
                'Pacific Life Open Tasks Volume Jun 1, 2024 to Jun 30, 2024.csv'
            );
        });

        it('should handle different status values', () => {
            expect(
                generateTasksCSVFilename('All Carriers', 'All', {
                    from: '2024-01-01',
                    to: '2024-12-31',
                })
            ).toContain('All Carriers All Tasks Volume');

            expect(
                generateTasksCSVFilename('MetLife', 'Open-Closed', {
                    from: '2024-01-01',
                    to: '2024-03-31',
                })
            ).toContain('MetLife Open-Closed Tasks Volume');
        });
    });
});
