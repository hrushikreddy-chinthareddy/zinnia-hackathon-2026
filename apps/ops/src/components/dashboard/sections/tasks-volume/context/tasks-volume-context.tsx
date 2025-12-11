import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, useMemo, useState } from 'react';

import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import {
    defaultDateFormat,
    formatProcessFilter,
} from '@deps/components/dashboard/utils';
import { Processes } from '@deps/models/case/case';
import { getTaskCountQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import {
    TaskCountGroupByEnum,
    TaskCountInputFilter,
    TaskCountOutputLevel1,
} from '@zinnia/api-types/types/analytics';

import {
    TaskStatus,
    TaskVolumeData,
    taskVolumeStartDates,
    TaskVolumeTimeframeOptions,
} from '../utils';

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

// Transform API response to UI format
const transformTaskData = (
    apiData: TaskCountOutputLevel1[]
): TaskVolumeData[] => {
    return apiData.map((process) => ({
        caseType: process.name,
        tasks: (process.values || []).map((task) => ({
            taskName: task.name,
            count: task.count,
        })),
        totalTasks: process.count,
    }));
};

export const TasksVolumeProvider: FC<PropsWithChildren> = ({ children }) => {
    const [selectedStatus, setSelectedStatus] = useState<TaskStatus[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<
        Processes | undefined
    >(undefined);

    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );

    const {
        timeframeRadio,
        timerange,
        handleTimeframeRadioChange,
        handleRangeChange,
    } = useTimeRangeFilter<TaskVolumeTimeframeOptions>({
        startDates: taskVolumeStartDates,
        defaultOption: TaskVolumeTimeframeOptions.Last6Months,
        dateFormat: defaultDateFormat,
    });

    const filter = useMemo((): TaskCountInputFilter => {
        const baseFilter: TaskCountInputFilter = {
            taskCreatedDateStart: timerange.from,
            taskCreatedDateEnd: timerange.to,
        };

        if (selectedStatus.length > 0) {
            baseFilter.taskStatus = selectedStatus;
        }

        if (selectedCarriers.length > 0) {
            baseFilter.carrier = selectedCarriers;
        }

        if (selectedBrokerDealers.length > 0) {
            baseFilter.brokerDealerName = selectedBrokerDealers;
        }

        if (selectedProcess) {
            baseFilter.process = formatProcessFilter(selectedProcess);
        }

        return baseFilter;
    }, [
        selectedStatus,
        selectedCarriers,
        selectedBrokerDealers,
        timerange,
        selectedProcess,
    ]);

    const {
        data: taskVolumeRawData,
        isFetching: taskVolumeDataFetching,
        isLoading: taskVolumeDataLoading,
        isError: taskVolumeDataError,
    } = useQuery({
        queryKey: ['taskVolumeData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getTaskCountQuery(filter, [
                TaskCountGroupByEnum.PROCESS,
                TaskCountGroupByEnum.TASK_NAME,
            ]),
        enabled: !!timerange.from && !!timerange.to,
    });

    // Transform API data to UI format
    const taskVolumeData = useMemo(() => {
        if (!taskVolumeRawData?.data) return undefined;
        return transformTaskData(taskVolumeRawData.data);
    }, [taskVolumeRawData]);

    // Calculate total task count
    const totalTaskCount = useMemo(() => {
        if (!taskVolumeData) return 0;
        return taskVolumeData.reduce(
            (total: number, caseType: TaskVolumeData) =>
                total + caseType.totalTasks,
            0
        );
    }, [taskVolumeData]);

    return (
        <TasksVolumeContext.Provider
            value={{
                timeframeRadio,
                handleTimeframeRadioChange,
                timerange,
                handleRangeChange,
                selectedStatus,
                setSelectedStatus,
                selectedProcess,
                setSelectedProcess,
                filter,
                taskVolumeData,
                taskVolumeDataLoading,
                taskVolumeDataError,
                taskVolumeDataFetching,
                totalTaskCount,
            }}
        >
            {children}
        </TasksVolumeContext.Provider>
    );
};
