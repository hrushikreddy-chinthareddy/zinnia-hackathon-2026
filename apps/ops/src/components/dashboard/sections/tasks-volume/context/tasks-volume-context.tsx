import { createContext, useContext } from 'react';

import {
    TaskStatus,
    TaskVolumeData,
    TaskVolumeTimeframeOptions,
} from '@deps/components/dashboard/sections/tasks-volume/utils';
import { Processes } from '@deps/models/case/case';
import { TaskCountInputFilter } from '@zinnia/api-types/types/analytics';

interface TaskVolumeContextTypes {
    timeframeRadio: TaskVolumeTimeframeOptions | undefined;
    handleTimeframeRadioChange: (value: TaskVolumeTimeframeOptions) => void;
    timerange: { from: string; to: string };
    handleRangeChange: (value: { from: string; to: string }) => void;
    selectedStatus: TaskStatus[];
    setSelectedStatus: (value: TaskStatus[]) => void;
    selectedProcess: Processes | undefined;
    setSelectedProcess: (value: Processes | undefined) => void;
    filter: TaskCountInputFilter;
    taskVolumeData: TaskVolumeData[] | undefined;
    taskVolumeDataLoading: boolean;
    taskVolumeDataError: boolean;
    taskVolumeDataFetching: boolean;
    totalTaskCount: number;
}

const defaultState: TaskVolumeContextTypes = {
    timeframeRadio: TaskVolumeTimeframeOptions.Last6Months,
    handleTimeframeRadioChange: () => {},
    timerange: { from: '', to: '' },
    handleRangeChange: () => {},
    selectedStatus: [], // Default to All statuses
    setSelectedStatus: () => {},
    selectedProcess: undefined,
    setSelectedProcess: () => {},
    filter: {},
    taskVolumeData: undefined,
    taskVolumeDataLoading: false,
    taskVolumeDataError: false,
    taskVolumeDataFetching: false,
    totalTaskCount: 0,
};

export const TasksVolumeContext =
    createContext<TaskVolumeContextTypes>(defaultState);

export const useTasksVolume = (): TaskVolumeContextTypes => {
    const context = useContext(TasksVolumeContext);

    if (!context) {
        throw new Error(
            'useTasksVolume must be used within a TasksVolumeProvider'
        );
    }

    return context;
};
