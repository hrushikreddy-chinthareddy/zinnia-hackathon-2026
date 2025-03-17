import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, useMemo, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import {
    ActiveAgingTimeRange,
    generateActiveAgingSeries,
    organizeAndMergeDataByTimeRange,
    TimeRangeData,
} from '@deps/components/dashboard/sections/active-aging/utils';
import { formatProcessFilter, createBaseQuery } from '@deps/components/dashboard/utils';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import { CaseDashboardStatsResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

type CaseStatusType = { [key: string]: Statuses };

const defaultCaseStatus: CaseStatusType = {
    [Statuses.InProgress]: Statuses.InProgress,
    [Statuses.Exception]: Statuses.Exception,
    [Statuses.NotStarted]: Statuses.NotStarted,
};

interface ActiveAgingContextTypes {
    timeframe: ActiveAgingTimeRange;
    setTimeframe: (value: ActiveAgingTimeRange) => void;
    groupBy: GroupByOptions;
    setGroupBy: (value: GroupByOptions) => void;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    filter: DashboardSearchFilter;
    activeAgingData: CaseDashboardStatsResponse | undefined;
    activeAgingDataLoading: boolean;
    activeAgingDataError: boolean;
    activeAgingDataFetching: boolean;
    chartSeries: {
        name: string;
        type: string;
        data: number[];
    }[];
    pieSeries: {
        name: string;
        data: {
            name: string;
            y: number;
        }[];
    }[];
    timeRangeData: TimeRangeData | null;
    totalCaseCount: number;
    caseStatus: CaseStatusType;
    setCaseStatus: (value: CaseStatusType) => void;
}

const defaultState = {
    timeframe: ActiveAgingTimeRange.ZERO_TO_SIX,
    setTimeframe: () => {},
    groupBy: GroupByOptions.Carrier,
    setGroupBy: () => {},
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    filter: {},
    activeAgingData: undefined,
    activeAgingDataLoading: false,
    activeAgingDataError: false,
    activeAgingDataFetching: false,
    chartSeries: [],
    pieSeries: [],
    timeRangeData: null,
    totalCaseCount: 0,
    caseStatus: defaultCaseStatus,
    setCaseStatus: () => {},
};

const filterNullData = (response: CaseDashboardStatsResponse) => {
    if (response?.data?.length) {
        response.data = response?.data?.filter(item => item.name !== null && item.name !== 'null');
    }
    return response;
};

export const ActiveAgingContext = createContext<ActiveAgingContextTypes>(defaultState);

export const ActiveAgingProvider: FC<PropsWithChildren> = ({ children }) => {
    const [timeframe, setTimeframe] = useState<ActiveAgingTimeRange>(ActiveAgingTimeRange.ZERO_TO_SIX);
    const [groupBy, setGroupBy] = useState<GroupByOptions>(GroupByOptions.ProcessSubType);
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);
    const [selectedProcess, setSelectedProcess] = useState<Processes | ExtendedProcesses>(Processes.NewBusiness);
    const [caseStatus, setCaseStatus] = useState(defaultCaseStatus);

    const { createdDateStart } = getStartAndEndDates('All');

    const filter: DashboardSearchFilter = {
        caseStatus: Object.keys(caseStatus) as Statuses[],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart,
        process: formatProcessFilter(selectedProcess),
    };

    const {
        data: activeAgingData,
        isFetching: activeAgingDataFetching,
        isLoading: activeAgingDataLoading,
        isError: activeAgingDataError,
    } = useQuery({
        queryKey: ['activeAgingData', filter, groupBy, timeframe],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(filter, [groupBy, GroupByOptions.CreatedAt]),
        enabled: Object.keys(filter).length > 0,
        select: filterNullData,
    });

    const timeRangeData = useMemo(() => organizeAndMergeDataByTimeRange(activeAgingData?.data || []), [activeAgingData]);

    const chartSeries = useMemo(() => generateActiveAgingSeries(timeframe, timeRangeData), [timeframe, timeRangeData]);
    const totalCaseCount = useMemo(() => timeRangeData[timeframe]?.total || 0, [timeframe, timeRangeData]);
    const pieSeries = useMemo(
        () => [
            {
                name: 'Active aging',
                data: Object.entries(timeRangeData).map(([key, value]) => ({ name: key.replace('D', ' Days'), y: value.total })),
            },
        ],
        [timeRangeData]
    );

    return (
        <ActiveAgingContext.Provider
            value={{
                timeframe,
                setTimeframe,
                selectedProcess,
                setSelectedProcess,
                filter,
                activeAgingData,
                activeAgingDataLoading,
                activeAgingDataError,
                activeAgingDataFetching,
                setGroupBy,
                groupBy,
                chartSeries,
                timeRangeData,
                totalCaseCount,
                pieSeries,
                caseStatus,
                setCaseStatus,
            }}
        >
            {children}
        </ActiveAgingContext.Provider>
    );
};
