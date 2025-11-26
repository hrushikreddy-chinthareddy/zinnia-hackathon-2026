import dayjs from 'dayjs';

import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { formatTaskTime } from '@deps/utils/dates';

// Flattened data structure for CSV export
export interface FlattenedCompletedTaskTimeData {
    caseType: string;
    secondMedian: number | string;
    taskName: string;
    count: number;
}

// Processing times data structure from context
export interface CompletedTaskTimeData {
    caseType: string;
    secondMedian: number;
    tasks: {
        taskName: string;
        secondMedian: number;
        count: number;
    }[];
    totalTasks: number;
}

// CSV column definitions for processing times export
export const CSV_COLUMNS: {
    label: string;
    key: keyof FlattenedCompletedTaskTimeData;
}[] = [
    { label: 'Case type', key: 'caseType' },
    { label: 'Median processing time', key: 'secondMedian' },
    { label: 'Task', key: 'taskName' },
    { label: 'Total tasks', key: 'count' },
];

/**
 * Get carrier name for display/export
 * @param selectedCarriers - Object of selected carriers from store
 * @returns Carrier name or "All Carriers"
 */
export const getCarrierName = (selectedCarriers: {
    [key: string]: string;
}): string => {
    const carrierKeys = Object.keys(selectedCarriers);
    if (carrierKeys.length === 0) return 'All Carriers';
    if (carrierKeys.length === 1) return selectedCarriers[carrierKeys[0]];
    return 'All Carriers';
};

/**
 * Formats completed task time stats
 * @param FlattenedCompletedTaskTimeData - Flattened completed task time data from context
 * @returns Array with stats values converted into a human-readble string
 */
export const formatTaskTimeFromArray = (
    processingTimesData: FlattenedCompletedTaskTimeData[]
): FlattenedCompletedTaskTimeData[] => {
    if (!processingTimesData) return [];

    return processingTimesData.map((caseType) => {
        return {
            caseType: caseType.caseType,
            secondMedian: formatTaskTime(caseType.secondMedian),
            taskName: caseType.taskName,
            count: caseType.count,
        };
    });
};

/**
 * Flatten completed task time data for CSV export
 * @param CompletedTaskTimeData - Nested completed task time data from context
 * @returns Flattened array with "All tasks" rows and individual task rows
 */
export const flattenCompletedTaskTimeData = (
    processingTimesData: CompletedTaskTimeData[] | undefined
): FlattenedCompletedTaskTimeData[] => {
    if (!processingTimesData) return [];

    const flattened: FlattenedCompletedTaskTimeData[] = [];
    processingTimesData.forEach((caseType) => {
        flattened.push({
            caseType: caseType.caseType,
            secondMedian: caseType.secondMedian,
            taskName: 'All tasks',
            count: caseType.totalTasks,
        });
        caseType.tasks.forEach((task) => {
            flattened.push({
                caseType: caseType.caseType,
                secondMedian: task.secondMedian,
                taskName: task.taskName,
                count: task.count,
            });
        });
    });

    return flattened;
};

/**
 * Generate CSV filename for completed task times export
 * @param carrierName - Carrier name or "All Carriers"
 * @param timerange - Date range object with from and to dates
 * @returns Formatted filename with .csv extension
 */
export const generateTasksCSVFilename = (
    carrierName: string,
    timerange: { from: string; to: string }
): string => {
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);
    return `${carrierName} Median Task Processing Times ${fromDate} to ${toDate}.csv`;
};
