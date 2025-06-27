import { useQuery } from '@tanstack/react-query';
import {
    CompletedCaseTimeGroupByEnum,
    CompletedCaseTimeInputFilter,
    CompletedCaseTimeOutputLevel1,
} from '@zinnia/api-types/types/analytics';
import { createContext, FC, PropsWithChildren, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import {
    TimeframeFilterOptions,
    startDates,
    formatProcessFilter,
} from '@deps/components/dashboard/utils';
import { Processes } from '@deps/models/case/case';
import { getCaseDashboardTimingQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';

interface CaseTimingContextTypes {
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    caseTimingData: CompletedCaseTimeOutputLevel1[] | undefined;
    caseTimingDataFetching: boolean;
    caseTimingDataError: Error | null;
    filter: CompletedCaseTimeInputFilter;
    timerange: {
        to: string;
        from: string;
    };
    handleRangeChange: (value: { from: string; to: string }) => void;
}

const defaultState = {
    timeframeRadio: TimeframeFilterOptions.Trailing12Months,
    handleTimeframeRadioChange: () => {},
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    caseTimingData: undefined,
    caseTimingDataFetching: false,
    caseTimingDataError: null,
    filter: {},
    graphStats: undefined,
    timerange: {
        to: '',
        from: '',
    },
    handleRangeChange: () => {},
};

export const CaseTimingContext =
    createContext<CaseTimingContextTypes>(defaultState);

export const CaseTimingProvider: FC<PropsWithChildren> = ({ children }) => {
    const [timeframeRadio, setTimeframeRadio] = useState<
        TimeframeFilterOptions | undefined
    >(TimeframeFilterOptions.Trailing12Months);

    const [timerange, setTimerange] = useState({
        from: timeframeRadio !== undefined ? startDates[timeframeRadio] : '',
        to: '',
    });

    const [selectedProcess, setSelectedProcess] = useState<
        Processes | ExtendedProcesses
    >(Processes.NewBusiness);
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );

    const handleTimeframeRadioChange = (value: TimeframeFilterOptions) => {
        setTimeframeRadio(value);
        setTimerange({
            from: startDates[value],
            to: '',
        });
    };

    const handleRangeChange = (value: { from: string; to: string }) => {
        setTimerange(value);
        setTimeframeRadio(undefined);
    };

    const filter = {
        updatedDateStart: timerange.from,
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
        queryFn: () =>
            getCaseDashboardTimingQuery(filter, [
                CompletedCaseTimeGroupByEnum.PROCESS_SUB_TYPE,
            ]),
        select: (data) =>
            data?.sort((a, b) => a.secondMedian - b.secondMedian) || data,
        placeholderData: (previousData) => previousData,
        enabled: Object.keys(filter).length > 0,
    });

    return (
        <CaseTimingContext.Provider
            value={{
                timeframeRadio,
                handleTimeframeRadioChange,
                timerange,
                handleRangeChange,
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
