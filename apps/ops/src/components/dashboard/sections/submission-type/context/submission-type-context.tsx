import { useQuery } from '@tanstack/react-query';
import {
    CaseCountGroupByEnum,
    CaseCountInputFilter,
    CaseCountOutput,
} from '@zinnia/api-types/types/analytics';
import {
    createContext,
    FC,
    PropsWithChildren,
    useEffect,
    useState,
} from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { combineSubmissionTypes } from '@deps/components/dashboard/sections/submission-type/utils';
import {
    TimeframeFilterOptions,
    startDates,
    formatProcessFilter,
    createBaseQuery,
} from '@deps/components/dashboard/utils';
import { Processes, Statuses } from '@deps/models/case/case';
import { useDashboardStore } from '@deps/store/store';

interface SubmissionTypeContextTypes {
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;
    setSubmissionVs: (value: CaseCountGroupByEnum) => void;
    submissionVs: CaseCountGroupByEnum;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    pieChartStatsLoading: boolean;
    graphStatsLoading: boolean;
    pieChartStatsFetching: boolean;
    graphStatsFetching: boolean;
    pieChartStatsError: Error | null;
    graphStatsError: Error | null;
    pieChartStats: CaseCountOutput | undefined;
    filter: CaseCountInputFilter;
    graphStats: CaseCountOutput | undefined;
    timerange: {
        to: string;
        from: string;
    };
    handleRangeChange: (value: { from: string; to: string }) => void;
}

const defaultState = {
    timeframeRadio: TimeframeFilterOptions.Trailing12Months,
    handleTimeframeRadioChange: () => {},
    setSubmissionVs: () => {},
    submissionVs: CaseCountGroupByEnum.CARRIER,
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    pieChartStatsLoading: false,
    graphStatsLoading: false,
    pieChartStatsFetching: false,
    graphStatsFetching: false,
    pieChartStatsError: null,
    graphStatsError: null,
    pieChartStats: undefined,
    filter: {},
    graphStats: undefined,
    timerange: {
        to: '',
        from: '',
    },
    handleRangeChange: () => {},
};

export const SubmissionTypeContext =
    createContext<SubmissionTypeContextTypes>(defaultState);

export const SubmissionTypeProvider: FC<PropsWithChildren> = ({ children }) => {
    const [timeframeRadio, setTimeframeRadio] = useState<
        TimeframeFilterOptions | undefined
    >(TimeframeFilterOptions.Trailing12Months);

    const [timerange, setTimerange] = useState({
        from: timeframeRadio !== undefined ? startDates[timeframeRadio] : '',
        to: '',
    });

    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );
    const [selectedProcess, setSelectedProcess] = useState<
        Processes | ExtendedProcesses
    >(Processes.NewBusiness);
    const [submissionVs, setSubmissionVs] = useState<CaseCountGroupByEnum>(
        CaseCountGroupByEnum.CARRIER
    );
    const graphGroupBy = [submissionVs, CaseCountGroupByEnum.APPLICATION_TYPE];

    const filter = {
        caseStatus: [
            Statuses.InProgress,
            Statuses.Exception,
            Statuses.NotStarted,
        ],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart: timerange.from,
        createdDateEnd: timerange.to || undefined,
        process: formatProcessFilter(selectedProcess),
    };

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

    const {
        data: pieChartStats,
        isLoading: pieChartStatsLoading,
        isFetching: pieChartStatsFetching,
        error: pieChartStatsError,
    } = useQuery({
        queryKey: ['submissionTypePieChartStats', filter],
        queryFn: () =>
            createBaseQuery(filter, [CaseCountGroupByEnum.APPLICATION_TYPE]),
        placeholderData: (previousData) => previousData,
        enabled: Object.keys(filter).length > 0,
        select: (response) => {
            const { data } = response;
            const updatedData = combineSubmissionTypes(data || []);
            return {
                ...response,
                data: updatedData,
            };
        },
    });

    const {
        data: graphStats,
        isLoading: graphStatsLoading,
        isFetching: graphStatsFetching,
        error: graphStatsError,
    } = useQuery({
        queryKey: ['submissionTypeGraphStats', graphGroupBy, filter],
        queryFn: () => createBaseQuery(filter, graphGroupBy),
        placeholderData: (previousData) => previousData,
        enabled: Object.keys(filter).length > 0,
        select: (response) => {
            const { data } = response;
            const updatedData = combineSubmissionTypes(data || []);
            return {
                ...response,
                data: updatedData,
            };
        },
    });

    useEffect(() => {
        if (Object.keys(selectedCarriers).length === 1) {
            setSubmissionVs(CaseCountGroupByEnum.PRODUCT_NAME);
        } else {
            setSubmissionVs(CaseCountGroupByEnum.CARRIER);
        }
    }, [selectedCarriers]);

    return (
        <SubmissionTypeContext.Provider
            value={{
                timeframeRadio,
                handleTimeframeRadioChange,
                submissionVs,
                setSubmissionVs,
                selectedProcess,
                setSelectedProcess,
                graphStats,
                pieChartStats,
                filter,
                pieChartStatsLoading,
                graphStatsLoading,
                pieChartStatsFetching,
                graphStatsFetching,
                pieChartStatsError,
                graphStatsError,
                timerange,
                handleRangeChange,
            }}
        >
            {children}
        </SubmissionTypeContext.Provider>
    );
};
