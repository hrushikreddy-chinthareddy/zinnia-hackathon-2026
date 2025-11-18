import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { defaultDateFormat } from '../../utils';

// Flattened data structure for CSV export
export interface FlattenedCompletedTaskTimeData {
    caseType: string;
    secondMedian: number | string;
    secondHigh: number | string;
    secondLow: number | string;
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

type TimeUnit = 'minute' | 'hour' | 'day';

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

/**
 * Converts a duration expressed in seconds into a human-readable string
 * @param duration Duration in seconds.
 * @returns A normalized, human-readable duration string.
 */
export const formatTaskTime = (duration: number | string): string => {
    const seconds =
        typeof duration === 'string' ? Number(duration.trim()) : duration;
    const dur = dayjs.duration(seconds, 'seconds');

    const format = (value: number, unit: TimeUnit): string => {
        const rounded = Number(value.toFixed(1));
        const displayValue = Number.isInteger(rounded)
            ? rounded.toFixed(0)
            : rounded.toString();
        const unitLabel = rounded === 1 ? unit : `${unit}s`;

        return `${displayValue} ${unitLabel}`;
    };

    const ONE_HOUR_IN_SECONDS = dayjs.duration(1, 'hour').asSeconds();
    const ONE_DAY_IN_SECONDS = dayjs.duration(1, 'day').asSeconds();

    if (seconds < ONE_HOUR_IN_SECONDS) {
        const totalMinutes = dur.asMinutes();

        return format(totalMinutes, 'minute');
    }

    if (seconds < ONE_DAY_IN_SECONDS) {
        const totalHours = dur.asHours();

        return format(totalHours, 'hour');
    }

    const totalDays = dur.asDays();
    return format(totalDays, 'day');
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
            secondHigh: formatTaskTime(caseType.secondHigh),
            secondLow: formatTaskTime(caseType.secondLow),
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
