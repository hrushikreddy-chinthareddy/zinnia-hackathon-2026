import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, useState } from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { combineElectronicAndDigital, submissionTypeQuery } from '@deps/components/dashboard/sections/submission-type/utils';
import { TimeframeFilterOptions, startDates, formatProcessFilter } from '@deps/components/dashboard/utils';
import { CaseDashboardStatsResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

interface SubmissionTypeContextTypes {
    timeframe: TimeframeFilterOptions;
    setTimeframe: (value: TimeframeFilterOptions) => void;
    setSubmissionVs: (value: GroupByOptions) => void;
    submissionVs: GroupByOptions;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    pieChartStatsLoading: boolean;
    graphStatsLoading: boolean;
    pieChartStatsFetching: boolean;
    graphStatsFetching: boolean;
    pieChartStatsError: Error | null;
    graphStatsError: Error | null;
    pieChartStats: CaseDashboardStatsResponse | undefined;
    filter: DashboardSearchFilter;
    graphStats: CaseDashboardStatsResponse | undefined;
}

const defaultState = {
    timeframe: TimeframeFilterOptions.Trailing12Months,
    setSubmissionVs: () => {},
    setTimeframe: () => {},
    submissionVs: GroupByOptions.Carrier,
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
};

export const SubmissionTypeContext = createContext<SubmissionTypeContextTypes>(defaultState);

export const SubmissionTypeProvider: FC<PropsWithChildren> = ({ children }) => {
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [submissionVs, setSubmissionVs] = useState<GroupByOptions>(GroupByOptions.Carrier);
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);
    const [selectedProcess, setSelectedProcess] = useState<Processes | ExtendedProcesses>(Processes.NewBusiness);

    const graphGroupBy = [submissionVs, GroupByOptions.ApplicationType];

    const filter: DashboardSearchFilter = {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart: startDates[timeframe],
        process: formatProcessFilter(selectedProcess),
    };

    const {
        data: pieChartStats,
        isLoading: pieChartStatsLoading,
        isFetching: pieChartStatsFetching,
        error: pieChartStatsError,
    } = useQuery({
        queryKey: ['submissionTypePieChartStats', filter],
        queryFn: () => submissionTypeQuery(filter, [GroupByOptions.ApplicationType]),
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
        select: response => {
            const { data } = response;
            const updatedData = combineElectronicAndDigital(data || []);
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
        queryFn: () => submissionTypeQuery(filter, graphGroupBy),
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
        select: response => {
            const { data } = response;
            const updatedData = combineElectronicAndDigital(data || []);
            return {
                ...response,
                data: updatedData,
            };
        },
    });

    return (
        <SubmissionTypeContext.Provider
            value={{
                timeframe,
                setTimeframe,
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
            }}
        >
            {children}
        </SubmissionTypeContext.Provider>
    );
};
