import { useQuery } from '@tanstack/react-query';
import {
    CompletedTaskTimeGroupByEnum,
    CompletedTaskTimeInputFilter,
    CompletedCaseTimeOutputLevel1,
} from '@xd/api-types/dist/generated-types/analytics';
import {
    createContext,
    FC,
    PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from 'react';

import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import {
    defaultDateFormat,
    formatProcessFilter,
    startDates,
    TimeframeFilterOptions,
} from '@deps/components/dashboard/utils';
import { Processes } from '@deps/models/case/case';
import { getCompletedTaskTimeQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';

import { CompletedTaskTimeData } from '../utils';

interface CompletedTaskTimeContextTypes {
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;
    timerange: { from: string; to: string };
    handleRangeChange: (value: { from: string; to: string }) => void;
    selectedProcess: Processes | undefined;
    setSelectedProcess: (value: Processes | undefined) => void;
    filter: CompletedTaskTimeInputFilter;
    completedTaskTimeData: CompletedTaskTimeData[] | undefined;
    completedTaskTimeDataLoading: boolean;
    completedTaskTimeDataError: boolean;
    completedTaskTimeDataFetching: boolean;
    totalTaskCount: number;
}

const defaultState: CompletedTaskTimeContextTypes = {
    timeframeRadio: TimeframeFilterOptions.Trailing12Months,
    handleTimeframeRadioChange: () => {},
    timerange: { from: '', to: '' },
    handleRangeChange: () => {},
    selectedProcess: undefined,
    setSelectedProcess: () => {},
    filter: {},
    completedTaskTimeData: undefined,
    completedTaskTimeDataLoading: false,
    completedTaskTimeDataError: false,
    completedTaskTimeDataFetching: false,
    totalTaskCount: 0,
};

export const CompletedTaskTimeContext =
    createContext<CompletedTaskTimeContextTypes>(defaultState);

// Transform API response to UI format
const transformCompletedTaskTimeData = (
    apiData: CompletedCaseTimeOutputLevel1[]
): CompletedTaskTimeData[] => {
    return apiData.map((process) => ({
        caseType: process.name,
        secondMedian: process.secondMedian,
        secondHigh: process.secondHigh,
        secondLow: process.secondLow,
        tasks: (process.values || []).map((task) => ({
            taskName: task.name,
            secondMedian: task.secondMedian,
            secondHigh: task.secondHigh,
            secondLow: task.secondLow,
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
            taskCreatedDateEnd: timerange.to,
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

export const useCompletedTaskTimes = (): CompletedTaskTimeContextTypes => {
    const context = useContext(CompletedTaskTimeContext);

    if (!context) {
        throw new Error(
            'useCompletedTaskTimes must be used within a CompletedTaskTimeProvider'
        );
    }

    return context;
};
