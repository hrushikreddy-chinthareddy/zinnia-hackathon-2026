import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { createContext, FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { createBaseQuery, defaultDateFormat, formatProcessFilter } from '@deps/components/dashboard/utils';
import { LineAndVolumeCategoryAndSeries, processGroupedData } from '@deps/helpers/dashboard/line-and-volume-category-chart.helper';
import { CaseDashboardStatsResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

import { TransactionTrendsTimeframe } from '../utils';

interface TransactionTrendsContextTypes {
    timeframe: TransactionTrendsTimeframe;
    setTimeframe: (value: TransactionTrendsTimeframe) => void;
    setGroupBy: (value: GroupByOptions) => void;
    groupBy: GroupByOptions;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    transactionTrendsData: CaseDashboardStatsResponse | undefined;
    transactionTrendsDataFetching: boolean;
    filter: DashboardSearchFilter;
    chartData: LineAndVolumeCategoryAndSeries | undefined;
}

const defaultState = {
    timeframe: TransactionTrendsTimeframe.Trailing12Months,
    transactionTrendsData: undefined,
    setTimeframe: () => {},
    transactionTrendsDataFetching: false,
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    setGroupBy: () => {},
    groupBy: GroupByOptions.ProcessSubType,
    filter: {},
    chartData: undefined,
};

export const TransactionTrendsContext = createContext<TransactionTrendsContextTypes>(defaultState);

export const TransactionTrendsProvider: FC<PropsWithChildren> = ({ children }) => {
    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(state => state);

    const [timeframe, setTimeframe] = useState<TransactionTrendsTimeframe>(TransactionTrendsTimeframe.Trailing12Months);
    const [selectedProcess, setSelectedProcess] = useState<Processes | ExtendedProcesses>(Processes.NewBusiness);
    const [groupBy, setGroupBy] = useState<GroupByOptions>(
        Object.keys(selectedCarriers).length ? GroupByOptions.ProcessSubType : GroupByOptions.Carrier
    );

    const today = dayjs();

    const startDates = useMemo(
        () => ({
            [TransactionTrendsTimeframe.Trailing12Months]: today.subtract(12, 'month').format(defaultDateFormat),
            [TransactionTrendsTimeframe.Last6Months]: today.subtract(6, 'month').format(defaultDateFormat),
            [TransactionTrendsTimeframe.Last90Days]: today.subtract(3, 'month').format(defaultDateFormat),
            [TransactionTrendsTimeframe.Last60Days]: today.subtract(2, 'month').format(defaultDateFormat),
            [TransactionTrendsTimeframe.LastMonth]: today.subtract(1, 'month').format(defaultDateFormat),
        }),
        [today]
    );

    const filter: DashboardSearchFilter = {
        createdDateStart: startDates[timeframe],
        process: formatProcessFilter(selectedProcess),
        caseStatus: [Statuses.Completed],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
    };

    const { data: transactionTrendsData, isFetching: transactionTrendsDataFetching } = useQuery({
        queryKey: ['transactionTrends', filter, groupBy],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(filter, [groupBy, GroupByOptions.UpdatedAt]),
        enabled: Object.keys(filter).length > 0,
    });

    // If there is a selected carrier, default to the product name. Otherwise back to carrier
    useEffect(() => {
        if (selectedCarriers && Object.keys(selectedCarriers).length) {
            setGroupBy(GroupByOptions.ProcessSubType);
        } else {
            setGroupBy(GroupByOptions.Carrier);
        }
    }, [selectedCarriers]);

    //TODO: This function is sooooooo sloooowww
    const chartData = useMemo(
        () => processGroupedData(transactionTrendsData?.data ?? [], timeframe),
        [transactionTrendsData?.data, timeframe]
    );
    return (
        <TransactionTrendsContext.Provider
            value={{
                timeframe,
                setTimeframe,
                setGroupBy,
                groupBy,
                selectedProcess,
                setSelectedProcess,
                transactionTrendsData,
                transactionTrendsDataFetching,
                filter,
                chartData,
            }}
        >
            {children}
        </TransactionTrendsContext.Provider>
    );
};
