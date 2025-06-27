import { useQuery } from '@tanstack/react-query';
import {
    ExceptionCountInputFilter,
    ExceptionCountGroupByEnum,
    ExceptionCountOutput,
} from '@zinnia/api-types/types/analytics';
import { createContext, FC, PropsWithChildren, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import {
    TimeframeFilterOptions,
    formatProcessFilter,
    startDates,
} from '@deps/components/dashboard/utils';
import { Processes } from '@deps/models/case/case';
import { getExceptionCountQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { ExceptionStatus } from '@deps/queries/tanstack/dashboard/types';
import { useDashboardStore } from '@deps/store/store';

export type IssueStatusType = { [key: string]: string };
export type ExceptionStatusMappingType = { [key: string]: ExceptionStatus[] };

interface IssueCountsByStatusContextTypes {
    //Issue Category Filter
    setCategory: (value: string[]) => void;
    // Case Type Filter
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;

    //Issue Status Filter
    exceptionStatus: ExceptionStatus[];
    setExceptionStatus: (value: ExceptionStatus[]) => void;

    // Table data
    issueCountsByStatusDataLoading: boolean;
    issueCountsByStatusData: ExceptionCountOutput | undefined;
    issueCountsByStatusDataError: boolean | null;
    issueCountsByStatusDataFetching: boolean;
    filter: ExceptionCountInputFilter;
    // Time range
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;
    handleRangeChange: (value: { from: string; to: string }) => void;
    timerange: {
        to: string;
        from: string;
    };
}

const defaultState = {
    //Issue Category Filter
    setCategory: () => {},
    // Case Type Filter
    selectedProcess: ExtendedProcesses.ALL,
    setSelectedProcess: () => {},
    //Issue Status Filter
    exceptionStatus: [],
    setExceptionStatus: () => {},
    // Table data
    issueCountsByStatusData: undefined,
    issueCountsByStatusDataError: null,
    issueCountsByStatusDataLoading: false,
    issueCountsByStatusDataFetching: false,
    filter: {},
    // Time range
    timeframeRadio: TimeframeFilterOptions.Trailing12Months,
    handleTimeframeRadioChange: () => {},
    handleRangeChange: () => {},
    timerange: {
        to: '',
        from: '',
    },
};

export const IssueCountsByStatusContext =
    createContext<IssueCountsByStatusContextTypes>(defaultState);
export const IssueCountsByStatusProvider: FC<PropsWithChildren> = ({
    children,
}) => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );

    //Issue Category Filter
    const [category, setCategory] = useState<string[]>([]);

    //Issue Status Filter
    const [exceptionStatus, setExceptionStatus] = useState([
        ExceptionStatus.UNRESOLVED,
        ExceptionStatus.INPROGRESS,
        ExceptionStatus.IN_PROGRESS,
        ExceptionStatus.NEW,
        ExceptionStatus.RESOLVED,
    ]);

    // Case Type Filter
    const [selectedProcess, setSelectedProcess] = useState<
        Processes | ExtendedProcesses
    >(ExtendedProcesses.ALL);

    // Time range
    const [timeframeRadio, setTimeframeRadio] = useState<
        TimeframeFilterOptions | undefined
    >(TimeframeFilterOptions.Trailing12Months);
    const [timerange, setTimerange] = useState({
        from: timeframeRadio !== undefined ? startDates[timeframeRadio] : '',
        to: '',
    });

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
        exceptionCategory: category,
        process: formatProcessFilter(selectedProcess),
        exceptionCreatedDateStart: timerange.from,
        exceptionCreatedDateEnd: timerange.to || undefined,
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        exceptionStatus,
    };

    const {
        data: issueCountsByStatusData,
        isFetching: issueCountsByStatusDataFetching,
        isLoading: issueCountsByStatusDataLoading,
        isError: issueCountsByStatusDataError,
    } = useQuery({
        queryKey: ['issueCountsByStatusData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getExceptionCountQuery(filter, [
                ExceptionCountGroupByEnum.EXCEPTION_DETAILED_REASON,
                ExceptionCountGroupByEnum.EXCEPTION_REASON,
                ExceptionCountGroupByEnum.EXCEPTION_CATEGORY,
            ]),
        enabled: Object.keys(filter).length > 0,
    });

    return (
        <IssueCountsByStatusContext.Provider
            value={{
                setCategory,
                selectedProcess,
                setSelectedProcess,
                issueCountsByStatusData,
                issueCountsByStatusDataError,
                issueCountsByStatusDataLoading,
                issueCountsByStatusDataFetching,
                filter,
                timeframeRadio,
                handleTimeframeRadioChange,
                timerange,
                handleRangeChange,
                exceptionStatus,
                setExceptionStatus,
            }}
        >
            {children}
        </IssueCountsByStatusContext.Provider>
    );
};
