import dayjs from 'dayjs';

import { defaultDateFormat } from '@deps/components/dashboard/utils';

// Flattened data structure for CSV export
export interface FlattenedCompletedTaskTimeData {
    caseType: string;
    secondMedian: number;
    secondHigh: number;
    secondLow: number;
    taskName: string;
    count: number;
}

// Processing times data structure from context
export interface CompletedTaskTimeData {
    caseType: string;
    secondMedian: number;
    secondHigh: number;
    secondLow: number;
    tasks: {
        taskName: string;
        secondMedian: number;
        secondHigh: number;
        secondLow: number;
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
    { label: 'Max processing time', key: 'secondHigh' },
    { label: 'Min. processing time', key: 'secondLow' },
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

export const formatTaskTime = (ms: number): string => {
    const ONE_MINUTE = 60;
    const ONE_HOUR = 60 * ONE_MINUTE;
    const ONE_DAY = 24 * ONE_HOUR;

    const format = (value: number, unit: string): string => {
        const rounded = Number(value.toFixed(1));
        const displayValue = Number.isInteger(rounded)
            ? rounded.toFixed(0)
            : rounded.toString();
        const unitLabel = rounded === 1 ? unit : `${unit}s`;

        return `${displayValue} ${unitLabel}`;
    };

    if (ms < ONE_HOUR) {
        return format(ms / ONE_MINUTE, 'minute');
    }

    if (ms < ONE_DAY) {
        return format(ms / ONE_HOUR, 'hour');
    }

    return format(ms / ONE_DAY, 'day');
};

/**
 * Flatten task volume data for CSV export
 * @param taskVolumeData - Nested task volume data from context
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
            secondHigh: caseType.secondHigh,
            secondLow: caseType.secondLow,
            taskName: 'All tasks',
            count: caseType.totalTasks,
        });
        caseType.tasks.forEach((task) => {
            flattened.push({
                caseType: caseType.caseType,
                secondMedian: task.secondMedian,
                secondHigh: task.secondHigh,
                secondLow: task.secondLow,
                taskName: task.taskName,
                count: task.count,
            });
        });
    });

    return flattened;
};

/**
 * Generate CSV filename for task volume export
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
