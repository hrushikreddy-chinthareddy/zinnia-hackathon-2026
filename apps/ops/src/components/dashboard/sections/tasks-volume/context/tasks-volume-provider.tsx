import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, PropsWithChildren, useMemo, useState } from 'react';

import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import {
    TaskStatus,
    TaskVolumeData,
    taskVolumeStartDates,
    TaskVolumeTimeframeOptions,
} from '@deps/components/dashboard/sections/tasks-volume/utils';
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

import { TasksVolumeContext } from './tasks-volume-context';

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
            taskCreatedDateEnd: timerange.to
                ? dayjs(timerange.to).add(1, 'day').toISOString()
                : undefined,
        };

        if (selectedStatus.length > 0) {
            baseFilter.taskStatus = selectedStatus;
        }

        if (Object.keys(selectedCarriers).length > 0) {
            baseFilter.carrier = Object.keys(selectedCarriers);
        }

        if (Object.keys(selectedBrokerDealers).length > 0) {
            baseFilter.brokerDealerName = Object.keys(selectedBrokerDealers);
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
