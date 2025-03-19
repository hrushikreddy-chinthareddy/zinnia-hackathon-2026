import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeframeFilterOptions, startDates, formatProcessFilter } from '@deps/components/dashboard/utils';
import { Processes } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { CaseTimingData } from '@deps/queries/api/cases';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardTimingQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';

interface CaseTimingContextTypes {
    timeframe: TimeframeFilterOptions;
    setTimeframe: (value: TimeframeFilterOptions) => void;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    caseTimingData: CaseTimingData[] | undefined;
    caseTimingDataFetching: boolean;
    caseTimingDataError: Error | null;
    filter: DashboardSearchFilter;
}

const defaultState = {
    timeframe: TimeframeFilterOptions.Trailing12Months,
    setTimeframe: () => {},
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    caseTimingData: undefined,
    caseTimingDataFetching: false,
    caseTimingDataError: null,
    filter: {},
    graphStats: undefined,
};

export const CaseTimingContext = createContext<CaseTimingContextTypes>(defaultState);

export const CaseTimingProvider: FC<PropsWithChildren> = ({ children }) => {
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [selectedProcess, setSelectedProcess] = useState<Processes | ExtendedProcesses>(Processes.NewBusiness);
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);

    const filter: DashboardSearchFilter = {
        createdDateStart: startDates[timeframe],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        process: formatProcessFilter(selectedProcess),
    };

    // get timing data by subprocess
    const {
        data: caseTimingData,
        isFetching: caseTimingDataFetching,
        error: caseTimingDataError,
    } = useQuery({
        queryKey: ['caseTimingChart', filter],
        queryFn: () => getCaseDashboardTimingQuery(filter, [GroupByOptions.ProcessSubType]),
        select: data => data.data?.sort((a, b) => a.secondMedian - b.secondMedian) || data,
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
    });

    return (
        <CaseTimingContext.Provider
            value={{
                timeframe,
                setTimeframe,
                caseTimingData,
                caseTimingDataFetching,
                caseTimingDataError,
                selectedProcess,
                setSelectedProcess,

                filter,
            }}
        >
            {children}
        </CaseTimingContext.Provider>
    );
};
