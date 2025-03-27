import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, useEffect, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { createBaseQuery, formatProcessFilter, startDates, TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { CaseDashboardStatsResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

interface TransactionTrendsContextTypes {
    timeframe: TimeframeFilterOptions;
    setTimeframe: (value: TimeframeFilterOptions) => void;
    setGroupBy: (value: GroupByOptions) => void;
    groupBy: GroupByOptions;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    transactionTrendsData: CaseDashboardStatsResponse | undefined;
    transactionTrendsDataFetching: boolean;
    filter: DashboardSearchFilter;
    transactionTrendsDataError: Error | null;
}

const defaultState = {
    timeframe: TimeframeFilterOptions.Trailing12Months,
    transactionTrendsData: undefined,
    setTimeframe: () => {},
    transactionTrendsDataFetching: false,
    transactionTrendsDataError: null,
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    setGroupBy: () => {},
    groupBy: GroupByOptions.ProcessSubType,
    filter: {},
};

export const TransactionTrendsContext = createContext<TransactionTrendsContextTypes>(defaultState);

export const TransactionTrendsProvider: FC<PropsWithChildren> = ({ children }) => {
    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(state => state);

    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [selectedProcess, setSelectedProcess] = useState<Processes | ExtendedProcesses>(Processes.NewBusiness);
    const [groupBy, setGroupBy] = useState<GroupByOptions>(
        Object.keys(selectedCarriers).length ? GroupByOptions.ProcessSubType : GroupByOptions.Carrier
    );

    const filter: DashboardSearchFilter = {
        createdDateStart: startDates[timeframe],
        process: formatProcessFilter(selectedProcess),
        caseStatus: [Statuses.Completed],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
    };

    const {
        data: transactionTrendsData,
        isFetching: transactionTrendsDataFetching,
        error: transactionTrendsDataError,
    } = useQuery({
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
                transactionTrendsDataError,
                filter,
            }}
        >
            {children}
        </TransactionTrendsContext.Provider>
    );
};
