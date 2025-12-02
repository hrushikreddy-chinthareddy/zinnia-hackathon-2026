import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, PropsWithChildren, useMemo, useState } from 'react';

import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { CompletedTaskTimeData } from '@deps/components/dashboard/sections/completed-task-times/utils';
import {
    defaultDateFormat,
    formatProcessFilter,
    TimeframeFilterOptions,
    startDates,
} from '@deps/components/dashboard/utils';
import { Processes } from '@deps/models/case/case';
import { getCompletedTaskTimeQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import {
    CompletedCaseTimeOutputLevel1,
    CompletedTaskTimeGroupByEnum,
    CompletedTaskTimeInputFilter,
} from '@zinnia/api-types/types/analytics';

import { CompletedTaskTimeContext } from './completed-task-times-context';

// Transform API response to UI format
const transformCompletedTaskTimeData = (
    apiData: CompletedCaseTimeOutputLevel1[]
): CompletedTaskTimeData[] => {
    return apiData.map((process) => ({
        caseType: process.name,
        secondMedian: process.secondMedian,
        tasks: (process.values || []).map((task) => ({
            taskName: task.name,
            secondMedian: task.secondMedian,
            count: task.count,
        })),
        totalTasks: process.count,
    }));
};

export const CompletedTaskTimeProvider: FC<PropsWithChildren> = ({
    children,
}) => {
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
    } = useTimeRangeFilter<TimeframeFilterOptions>({
        startDates,
        defaultOption: TimeframeFilterOptions.Trailing12Months,
        dateFormat: defaultDateFormat,
    });

    const filter = useMemo((): CompletedTaskTimeInputFilter => {
        const baseFilter: CompletedTaskTimeInputFilter = {
            taskCreatedDateStart: timerange.from,
            taskCreatedDateEnd: dayjs(timerange.to).add(1, 'day').toISOString(),
        };

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
    }, [selectedCarriers, selectedBrokerDealers, timerange, selectedProcess]);

    const {
        data: completedTaskTimeRawData,
        isFetching: completedTaskTimeDataFetching,
        isLoading: completedTaskTimeDataLoading,
        isError: completedTaskTimeDataError,
    } = useQuery({
        queryKey: ['completedTaskTimeData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getCompletedTaskTimeQuery(filter, [
                CompletedTaskTimeGroupByEnum.PROCESS,
                CompletedTaskTimeGroupByEnum.TASK_NAME,
            ]),
        enabled: !!timerange.from && !!timerange.to,
    });

    // Transform API data to UI format
    const completedTaskTimeData = useMemo(() => {
        if (!completedTaskTimeRawData?.data) return undefined;
        return transformCompletedTaskTimeData(completedTaskTimeRawData.data);
    }, [completedTaskTimeRawData]);

    // Calculate total task count
    const totalTaskCount = useMemo(() => {
        if (!completedTaskTimeData) return 0;
        return completedTaskTimeData.reduce(
            (total: number, caseType: CompletedTaskTimeData) =>
                total + caseType.totalTasks,
            0
        );
    }, [completedTaskTimeData]);

    return (
        <CompletedTaskTimeContext.Provider
            value={{
                timeframeRadio,
                handleTimeframeRadioChange,
                timerange,
                handleRangeChange,
                selectedProcess,
                setSelectedProcess,
                filter,
                completedTaskTimeData,
                completedTaskTimeDataLoading,
                completedTaskTimeDataError,
                completedTaskTimeDataFetching,
                totalTaskCount,
            }}
        >
            {children}
        </CompletedTaskTimeContext.Provider>
    );
};
