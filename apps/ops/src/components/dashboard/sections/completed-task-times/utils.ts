import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import { TFunction } from 'next-i18next';

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

export const generateCompletedTaskTimesSeries = (
    taskNames: string[],
    caseTypes: CompletedTaskTimeData[],
    colorMap: Map<string, string>,
    secondsInDay: number
): Highcharts.SeriesOptionsType[] => {
    return taskNames.map((taskName) => {
        const data = caseTypes.map((caseType) => {
            const task = caseType.tasks.find(
                (entry) => entry.taskName === taskName
            );
            if (!task) {
                return {
                    y: 0,
                    custom: { seconds: 0, count: 0 },
                };
            }

            return {
                y: task.secondMedian / secondsInDay,
                custom: {
                    seconds: task.secondMedian,
                    count: task.count,
                },
            };
        });

        return {
            name: taskName,
            type: 'bar',
            data,
            color:
                colorMap.get(taskName) ??
                'var(--color-base-text-link, #00628B)',
            stack: 'tasks',
        };
    });
};

// CSV column generation for processing times export
export const generateCsvColumns = (
    t: TFunction
): { label: string; key: keyof FlattenedCompletedTaskTimeData }[] => {
    return [
        { label: t('allFields.caseType'), key: 'caseType' },
        { label: t('allFields.medianProcessingTime'), key: 'secondMedian' },
        { label: t('allFields.task'), key: 'taskName' },
        { label: t('allFields.totalTasks'), key: 'count' },
    ];
};

/**
 * Get carrier name for display/export
 * @param selectedCarriers - Object of selected carriers from store
 * @returns Carrier name or "All Carriers"
 */
export const getCarrierName = (
    selectedCarriers: string[],
    t: TFunction
): string => {
    const carrierKeys = selectedCarriers;
    if (carrierKeys.length === 1) return selectedCarriers[0];
    return t('allFields.allCarriers');
};

/**
 * Formats completed task time stats
 * @param FlattenedCompletedTaskTimeData - Flattened completed task time data from context
 * @returns Array with stats values converted into a human-readble string
 */
export const formatTaskTimeFromArray = (
    processingTimesData: FlattenedCompletedTaskTimeData[],
    t: TFunction
): FlattenedCompletedTaskTimeData[] => {
    if (!processingTimesData) return [];

    return processingTimesData.map((caseType) => {
        return {
            caseType: caseType.caseType,
            secondMedian: formatTaskTime(caseType.secondMedian, t),
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
    timerange: { from: string; to: string },
    t: TFunction
): string => {
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);

    return `${t('allFields.medianTaskProcessingTimesFilename', {
        carrierName,
        fromDate,
        toDate,
    })}.csv`;
};
