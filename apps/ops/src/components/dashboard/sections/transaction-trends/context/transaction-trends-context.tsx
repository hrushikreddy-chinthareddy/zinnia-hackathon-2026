import { useQuery } from '@tanstack/react-query';
import { CaseCountGroupByEnum, CaseCountInputFilter, CaseCountOutput } from '@zinnia/api-types/types/analytics';
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
import { Processes, Statuses } from '@deps/models/case/case';
import { useDashboardStore } from '@deps/store/store';

interface TransactionTrendsContextTypes {
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;

    setGroupBy: (value: CaseCountGroupByEnum) => void;
    groupBy: CaseCountGroupByEnum;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    transactionTrendsData: CaseCountOutput | undefined;
    transactionTrendsDataFetching: boolean;
    filter: CaseCountInputFilter;
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
    groupBy: CaseCountGroupByEnum.PROCESS_SUB_TYPE,
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
    const [groupBy, setGroupBy] = useState<CaseCountGroupByEnum>(
        Object.keys(selectedCarriers).length ? CaseCountGroupByEnum.PROCESS_SUB_TYPE : CaseCountGroupByEnum.CARRIER
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

    const filter = {
        updatedDateStart: timerange.from,
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
        queryFn: () => createBaseQuery(filter, [groupBy, CaseCountGroupByEnum.UPDATED_DAY]),
        enabled: Object.keys(filter).length > 0,
    });

    // If there is a selected carrier, default to the product name. Otherwise back to carrier
    useEffect(() => {
        if (selectedCarriers && Object.keys(selectedCarriers).length) {
            setGroupBy(CaseCountGroupByEnum.PROCESS_SUB_TYPE);
        } else {
            setGroupBy(CaseCountGroupByEnum.CARRIER);
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
