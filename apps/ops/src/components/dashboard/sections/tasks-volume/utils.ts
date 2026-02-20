import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { defaultDateFormat } from '@deps/components/dashboard/utils';

// Flattened data structure for CSV export
export interface FlattenedTaskData {
    caseType: string;
    taskName: string;
    count: number;
}

// Task volume data structure from context
export interface TaskVolumeData {
    caseType: string;
    tasks: {
        taskName: string;
        count: number;
    }[];
    totalTasks: number;
}

export enum TaskVolumeTimeframeOptions {
    Last1Day = '1D',
    LastWeek = '1W',
    Last1Month = '1M',
    Last3Months = '3M',
    Last6Months = '6M',
}

export const taskVolumeStartDates: Record<TaskVolumeTimeframeOptions, string> =
    {
        [TaskVolumeTimeframeOptions.Last6Months]: dayjs()
            .subtract(6, 'month')
            .format(defaultDateFormat),
        [TaskVolumeTimeframeOptions.Last3Months]: dayjs()
            .subtract(3, 'month')
            .format(defaultDateFormat),
        [TaskVolumeTimeframeOptions.Last1Month]: dayjs()
            .subtract(1, 'month')
            .format(defaultDateFormat),
        [TaskVolumeTimeframeOptions.LastWeek]: dayjs()
            .subtract(1, 'week')
            .format(defaultDateFormat),
        [TaskVolumeTimeframeOptions.Last1Day]: dayjs()
            .subtract(1, 'day')
            .format(defaultDateFormat),
    };
/**
 * CSV column definitions for task volume export (translated)
 */
export const generateCsvColumns = (
    t: TFunction
): { label: string; key: keyof FlattenedTaskData }[] => [
    { label: t('allFields.caseType'), key: 'caseType' },
    { label: t('allFields.task'), key: 'taskName' },
    { label: t('allFields.totalTasks'), key: 'count' },
];

export enum TaskStatus {
    OPEN = 'OPEN',
    INPROGRESS = 'INPROGRESS',
    CLOSED = 'CLOSED',
    COMPLETED = 'COMPLETED',
    COMPLETE = 'COMPLETE',
}
export type StatusDisplayText = 'Open' | 'Closed' | 'Open-Closed' | 'All';
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
    if (carrierKeys.length === 0) return t('allFields.allCarriers');
    if (carrierKeys.length === 1) return carrierKeys[0];
    return t('allFields.allCarriers');
};

/**
 * Get status display text based on selected statuses
 * @param selectedStatus - Array of selected TaskStatus values
 * @returns Display text: "Open", "Closed", "Open-Closed", or "All"
 */
export const getStatusDisplayText = (
    selectedStatus: TaskStatus[],
    t: TFunction
): StatusDisplayText => {
    const hasOpen =
        selectedStatus.includes(TaskStatus.OPEN) ||
        selectedStatus.includes(TaskStatus.INPROGRESS);
    const hasClosed =
        selectedStatus.includes(TaskStatus.CLOSED) ||
        selectedStatus.includes(TaskStatus.COMPLETED) ||
        selectedStatus.includes(TaskStatus.COMPLETE);

    if (hasOpen && hasClosed) return t('allFields.openClosed');
    if (hasOpen) return t('allFields.open');
    if (hasClosed) return t('allFields.closed');
    return t('allFields.all');
};

/**
 * Flatten task volume data for CSV export
 * @param taskVolumeData - Nested task volume data from context
 * @returns Flattened array with "All tasks" rows and individual task rows
 */
export const flattenTaskData = (
    taskVolumeData: TaskVolumeData[] | undefined
): FlattenedTaskData[] => {
    if (!taskVolumeData) return [];

    const flattened: FlattenedTaskData[] = [];
    taskVolumeData.forEach((caseType) => {
        flattened.push({
            caseType: caseType.caseType,
            taskName: 'All tasks',
            count: caseType.totalTasks,
        });
        caseType.tasks.forEach((task) => {
            flattened.push({
                caseType: caseType.caseType,
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
 * @param statusText - Status display text
 * @param timerange - Date range object with from and to dates
 * @returns Formatted filename with .csv extension
 */
export const generateTasksCSVFilename = (
    carrierName: string,
    statusText: StatusDisplayText,
    timerange: { from: string; to: string }
): string => {
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);
    return `${carrierName} ${statusText} Tasks Volume ${fromDate} to ${toDate}.csv`;
};
