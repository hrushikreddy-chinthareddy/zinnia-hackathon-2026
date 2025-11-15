import dayjs from 'dayjs';

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
/**
 * CSV column definitions for task volume export
 */
export const CSV_COLUMNS: { label: string; key: keyof FlattenedTaskData }[] = [
    { label: 'Case type', key: 'caseType' },
    { label: 'Task', key: 'taskName' },
    { label: 'Total tasks', key: 'count' },
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
export const getCarrierName = (selectedCarriers: {
    [key: string]: string;
}): string => {
    const carrierKeys = Object.keys(selectedCarriers);
    if (carrierKeys.length === 0) return 'All Carriers';
    if (carrierKeys.length === 1) return selectedCarriers[carrierKeys[0]];
    return 'All Carriers';
};

/**
 * Get status display text based on selected statuses
 * @param selectedStatus - Array of selected TaskStatus values
 * @returns Display text: "Open", "Closed", "Open-Closed", or "All"
 */
export const getStatusDisplayText = (
    selectedStatus: TaskStatus[]
): StatusDisplayText => {
    const hasOpen =
        selectedStatus.includes(TaskStatus.OPEN) ||
        selectedStatus.includes(TaskStatus.INPROGRESS);
    const hasClosed =
        selectedStatus.includes(TaskStatus.CLOSED) ||
        selectedStatus.includes(TaskStatus.COMPLETED) ||
        selectedStatus.includes(TaskStatus.COMPLETE);

    if (hasOpen && hasClosed) return 'Open-Closed';
    if (hasOpen) return 'Open';
    if (hasClosed) return 'Closed';
    return 'All';
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
