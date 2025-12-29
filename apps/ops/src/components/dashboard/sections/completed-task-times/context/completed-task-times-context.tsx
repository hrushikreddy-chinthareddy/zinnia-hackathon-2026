import { createContext, useContext } from 'react';

import { CompletedTaskTimeData } from '@deps/components/dashboard/sections/completed-task-times/utils';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { Processes } from '@deps/models/case/case';
import { CompletedTaskTimeInputFilter } from '@zinnia/api-types/types/analytics';

interface CompletedTaskTimeContextTypes {
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;
    timerange: { from: string; to: string };
    handleRangeChange: (value: { from: string; to: string }) => void;
    selectedProcess: Processes | undefined;
    setSelectedProcess: (value: Processes | undefined) => void;
    filter: CompletedTaskTimeInputFilter;
    completedTaskTimeData: CompletedTaskTimeData[] | undefined;
    completedTaskTimeDataLoading: boolean;
    completedTaskTimeDataError: boolean;
    completedTaskTimeDataFetching: boolean;
    totalTaskCount: number;
}

const defaultState: CompletedTaskTimeContextTypes = {
    timeframeRadio: TimeframeFilterOptions.Trailing12Months,
    handleTimeframeRadioChange: () => {},
    timerange: { from: '', to: '' },
    handleRangeChange: () => {},
    selectedProcess: undefined,
    setSelectedProcess: () => {},
    filter: {},
    completedTaskTimeData: undefined,
    completedTaskTimeDataLoading: false,
    completedTaskTimeDataError: false,
    completedTaskTimeDataFetching: false,
    totalTaskCount: 0,
};

export const CompletedTaskTimeContext =
    createContext<CompletedTaskTimeContextTypes>(defaultState);

export const useCompletedTaskTimes = (): CompletedTaskTimeContextTypes => {
    const context = useContext(CompletedTaskTimeContext);

    if (!context) {
        throw new Error(
            'useCompletedTaskTimes must be used within a CompletedTaskTimeProvider'
        );
    }

    return context;
};
