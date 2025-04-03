import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { createContext, FC, PropsWithChildren, useEffect, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import {
    createBaseQuery,
    defaultDateFormat,
    formatProcessFilter,
    startDates,
    TimeframeFilterOptions,
} from '@deps/components/dashboard/utils';
import { CaseDashboardStatsResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

interface TransactionTrendsContextTypes {
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;

    setGroupBy: (value: GroupByOptions) => void;
    groupBy: GroupByOptions;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    transactionTrendsData: CaseDashboardStatsResponse | undefined;
    transactionTrendsDataFetching: boolean;
    filter: DashboardSearchFilter;
    transactionTrendsDataError: Error | null;
    timerange: {
        to: string;
        from: string;
    };
    handleRangeChange: (value: { from: string; to: string }) => void;
}

const defaultState = {
    timeframeRadio: TimeframeFilterOptions.Trailing12Months,
    handleTimeframeRadioChange: () => {},

    transactionTrendsData: undefined,

    transactionTrendsDataFetching: false,
    transactionTrendsDataError: null,
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    setGroupBy: () => {},
    groupBy: GroupByOptions.ProcessSubType,
    filter: {},
    timerange: {
        to: '',
        from: '',
    },
    handleRangeChange: () => {},
};

export const TransactionTrendsContext = createContext<TransactionTrendsContextTypes>(defaultState);

export const TransactionTrendsProvider: FC<PropsWithChildren> = ({ children }) => {
    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(state => state);

    const [selectedProcess, setSelectedProcess] = useState<Processes | ExtendedProcesses>(Processes.NewBusiness);
    const [groupBy, setGroupBy] = useState<GroupByOptions>(
        Object.keys(selectedCarriers).length ? GroupByOptions.ProcessSubType : GroupByOptions.Carrier
    );

    const [timeframeRadio, setTimeframeRadio] = useState<TimeframeFilterOptions | undefined>(TimeframeFilterOptions.Trailing12Months);

    const [timerange, setTimerange] = useState({
        from: timeframeRadio !== undefined ? startDates[timeframeRadio] : '',
        to: dayjs().format(defaultDateFormat),
    });

    const handleTimeframeRadioChange = (value: TimeframeFilterOptions) => {
        setTimeframeRadio(value);
        setTimerange({
            from: startDates[value],
            to: dayjs().format(defaultDateFormat),
        });
    };

    const handleRangeChange = (value: { from: string; to: string }) => {
        setTimerange(value);
        setTimeframeRadio(undefined);
    };

    const filter: DashboardSearchFilter = {
        createdDateStart: timerange.from,
        createdDateEnd: timerange.to || undefined,
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
                timeframeRadio,
                handleTimeframeRadioChange,
                setGroupBy,
                groupBy,
                selectedProcess,
                setSelectedProcess,
                transactionTrendsData,
                transactionTrendsDataFetching,
                transactionTrendsDataError,
                filter,
                timerange,
                handleRangeChange,
            }}
        >
            {children}
        </TransactionTrendsContext.Provider>
    );
};
